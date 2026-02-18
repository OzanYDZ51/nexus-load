import { TRUCK, ITEM_COLORS } from "./constants";
import type { Product, OrderItem, PlacedItem, TruckLoad } from "./types";

interface PackItem extends Product {
  color: number;
}

interface Orientation {
  l: number;
  w: number;
  h: number;
}

interface Point {
  x: number;
  y: number;
  z: number;
}

function boxesOverlap(
  pos1: Point,
  dims1: Orientation,
  pos2: Point,
  dims2: Orientation
): boolean {
  return (
    pos1.x < pos2.x + dims2.l - 0.01 &&
    pos1.x + dims1.l > pos2.x + 0.01 &&
    pos1.y < pos2.y + dims2.w - 0.01 &&
    pos1.y + dims1.w > pos2.y + 0.01 &&
    pos1.z < pos2.z + dims2.h - 0.01 &&
    pos1.z + dims1.h > pos2.z + 0.01
  );
}

/**
 * Find the support item directly below a given point.
 * Returns the placed item whose top face matches point.z and whose
 * XY footprint covers the new item's base sufficiently.
 */
function findSupport(
  truck: TruckLoad,
  point: Point,
  orient: Orientation
): PlacedItem | null {
  for (const placed of truck.items) {
    const topZ = placed.position.z + placed.dims.h;
    if (Math.abs(topZ - point.z) > 0.02) continue;

    // Check XY overlap: support must cover at least 80% of the new item's base
    const overlapX = Math.max(
      0,
      Math.min(point.x + orient.l, placed.position.x + placed.dims.l) -
        Math.max(point.x, placed.position.x)
    );
    const overlapY = Math.max(
      0,
      Math.min(point.y + orient.w, placed.position.y + placed.dims.w) -
        Math.max(point.y, placed.position.y)
    );
    const overlapArea = overlapX * overlapY;
    const itemArea = orient.l * orient.w;

    if (itemArea > 0 && overlapArea / itemArea >= 0.8) {
      return placed;
    }
  }
  return null;
}

/**
 * Count the stack level by walking down the chain of supports.
 */
function getStackLevel(truck: TruckLoad, support: PlacedItem): number {
  return support.stackLevel + 1;
}

function isStackingPoint(
  truck: TruckLoad,
  point: Point,
  reference: string
): boolean {
  if (point.z <= 0.01) return false;
  return truck.items.some((pi) => {
    if (pi.reference !== reference || !pi.stackable) return false;
    const topZ = pi.position.z + pi.dims.h;
    if (Math.abs(topZ - point.z) > 0.02) return false;
    return (
      Math.abs(point.x - pi.position.x) < 0.01 &&
      Math.abs(point.y - pi.position.y) < 0.01
    );
  });
}

function tryPlace(truck: TruckLoad, item: PackItem): boolean {
  const allOrientations: Orientation[] = [
    { l: item.longueur, w: item.largeur, h: item.hauteur },
    { l: item.largeur, w: item.longueur, h: item.hauteur },
    { l: item.longueur, w: item.hauteur, h: item.largeur },
    { l: item.hauteur, w: item.largeur, h: item.longueur },
    { l: item.largeur, w: item.hauteur, h: item.longueur },
    { l: item.hauteur, w: item.longueur, h: item.largeur },
  ];

  // Filtrer les orientations selon la contrainte
  // "longueur" → la longueur du produit doit aller le long du camion (axe X = orient.l)
  // "largeur" → la longueur du produit doit aller en travers du camion (axe Y = orient.w)
  const orientations = item.orientationConstraint
    ? allOrientations.filter((o) =>
        item.orientationConstraint === "longueur"
          ? Math.abs(o.l - item.longueur) < 0.001
          : Math.abs(o.w - item.longueur) < 0.001
      )
    : allOrientations;

  const sortedPoints = [...truck.availablePoints].sort((a, b) => {
    if (item.stackable) {
      const aStack = isStackingPoint(truck, a, item.reference);
      const bStack = isStackingPoint(truck, b, item.reference);
      if (aStack !== bStack) return aStack ? -1 : 1;
      if (aStack && bStack) {
        if (Math.abs(a.z - b.z) > 0.01) return a.z - b.z;
      }
    }
    if (Math.abs(a.z - b.z) > 0.01) return a.z - b.z;
    if (Math.abs(a.y - b.y) > 0.01) return a.y - b.y;
    return a.x - b.x;
  });

  for (const point of sortedPoints) {
    for (const orient of orientations) {
      if (point.x + orient.l > TRUCK.length + 0.01) continue;
      if (point.y + orient.w > TRUCK.width + 0.01) continue;
      if (point.z + orient.h > TRUCK.height + 0.01) continue;

      // Stacking validation for elevated points
      let stackLevel = 0;
      if (point.z > 0.01) {
        const support = findSupport(truck, point, orient);
        if (!support) continue; // No support below — skip

        // Check stacking rules: both must be stackable, same reference
        if (
          !support.stackable ||
          !item.stackable ||
          support.reference !== item.reference
        ) {
          continue; // Not stackable or different reference — skip elevated point
        }

        stackLevel = getStackLevel(truck, support);
        const maxLevels = item.maxStackLevels ?? support.maxStackLevels ?? 2;
        if (stackLevel >= maxLevels) continue; // Stack limit reached
      }

      let overlap = false;
      for (const placed of truck.items) {
        if (boxesOverlap(point, orient, placed.position, placed.dims)) {
          overlap = true;
          break;
        }
      }

      if (!overlap) {
        const placedItem: PlacedItem = {
          ...item,
          position: { ...point },
          dims: { ...orient },
          stackLevel,
        };
        truck.items.push(placedItem);
        truck.currentWeight += item.poids;

        const idx = truck.availablePoints.findIndex(
          (p) =>
            Math.abs(p.x - point.x) < 0.01 &&
            Math.abs(p.y - point.y) < 0.01 &&
            Math.abs(p.z - point.z) < 0.01
        );
        if (idx > -1) truck.availablePoints.splice(idx, 1);

        const newPoints: Point[] = [
          { x: +(point.x + orient.l).toFixed(4), y: point.y, z: point.z },
          { x: point.x, y: +(point.y + orient.w).toFixed(4), z: point.z },
          { x: point.x, y: point.y, z: +(point.z + orient.h).toFixed(4) },
        ];

        for (const np of newPoints) {
          if (
            np.x <= TRUCK.length &&
            np.y <= TRUCK.width &&
            np.z <= TRUCK.height
          ) {
            const exists = truck.availablePoints.some(
              (ep) =>
                Math.abs(ep.x - np.x) < 0.01 &&
                Math.abs(ep.y - np.y) < 0.01 &&
                Math.abs(ep.z - np.z) < 0.01
            );
            if (!exists) truck.availablePoints.push(np);
          }
        }

        // Fix #4: Clean up dead elevated points that no longer sit on any item's top face
        truck.availablePoints = truck.availablePoints.filter((p) => {
          if (p.z < 0.01) return true;
          return truck.items.some((pi) => {
            const topZ = pi.position.z + pi.dims.h;
            if (Math.abs(topZ - p.z) > 0.02) return false;
            return (
              p.x >= pi.position.x - 0.01 &&
              p.x <= pi.position.x + pi.dims.l + 0.01 &&
              p.y >= pi.position.y - 0.01 &&
              p.y <= pi.position.y + pi.dims.w + 0.01
            );
          });
        });

        return true;
      }
    }
  }

  return false;
}

export function binPack3D(orderItems: OrderItem[]): TruckLoad[] {
  const items: PackItem[] = [];
  let colorIdx = 0;
  const colorMap: Record<string, number> = {};

  for (const orderItem of orderItems) {
    if (!(orderItem.reference in colorMap)) {
      colorMap[orderItem.reference] = ITEM_COLORS[colorIdx % ITEM_COLORS.length];
      colorIdx++;
    }
    for (let i = 0; i < orderItem.qty; i++) {
      items.push({
        reference: orderItem.reference,
        name: orderItem.name,
        longueur: orderItem.longueur,
        largeur: orderItem.largeur,
        hauteur: orderItem.hauteur,
        poids: orderItem.poids,
        volume: orderItem.volume,
        stackable: orderItem.stackable,
        maxStackLevels: orderItem.maxStackLevels,
        orientationConstraint: orderItem.orientationConstraint,
        color: colorMap[orderItem.reference],
      });
    }
  }

  // Fix #1: Multi-criteria sort — stackable first, group by reference, then volume desc
  items.sort((a, b) => {
    if (a.stackable !== b.stackable) return a.stackable ? -1 : 1;
    if (a.reference !== b.reference) return a.reference < b.reference ? -1 : 1;
    return b.volume - a.volume;
  });

  const trucks: TruckLoad[] = [];

  for (const item of items) {
    let placed = false;

    // Fix #2: For stackable items, try trucks with same reference first
    const truckOrder = item.stackable
      ? [
          ...trucks.filter((t) =>
            t.items.some((pi) => pi.reference === item.reference)
          ),
          ...trucks.filter(
            (t) => !t.items.some((pi) => pi.reference === item.reference)
          ),
        ]
      : trucks;

    for (const truck of truckOrder) {
      if (truck.currentWeight + item.poids > TRUCK.maxWeight) continue;
      if (tryPlace(truck, item)) {
        placed = true;
        break;
      }
    }

    if (!placed) {
      const newTruck: TruckLoad = {
        items: [],
        currentWeight: 0,
        availablePoints: [{ x: 0, y: 0, z: 0 }],
      };
      if (tryPlace(newTruck, item)) {
        trucks.push(newTruck);
      } else {
        // Fix #3: Try all 6 orientations ignoring orientation constraint
        const fallbackOrientations: Orientation[] = [
          { l: item.longueur, w: item.largeur, h: item.hauteur },
          { l: item.largeur, w: item.longueur, h: item.hauteur },
          { l: item.longueur, w: item.hauteur, h: item.largeur },
          { l: item.hauteur, w: item.largeur, h: item.longueur },
          { l: item.largeur, w: item.hauteur, h: item.longueur },
          { l: item.hauteur, w: item.longueur, h: item.largeur },
        ];
        let forcePlaced = false;
        for (const orient of fallbackOrientations) {
          if (
            orient.l <= TRUCK.length + 0.01 &&
            orient.w <= TRUCK.width + 0.01 &&
            orient.h <= TRUCK.height + 0.01
          ) {
            newTruck.items.push({
              ...item,
              position: { x: 0, y: 0, z: 0 },
              dims: orient,
              color: item.color,
              stackLevel: 0,
            });
            newTruck.currentWeight += item.poids;
            newTruck.availablePoints = [
              { x: orient.l, y: 0, z: 0 },
              { x: 0, y: orient.w, z: 0 },
              { x: 0, y: 0, z: orient.h },
            ];
            trucks.push(newTruck);
            forcePlaced = true;
            break;
          }
        }
        if (!forcePlaced) {
          console.error(
            `Item "${item.reference}" (${item.longueur}x${item.largeur}x${item.hauteur}) exceeds truck dimensions — skipped.`
          );
        }
      }
    }
  }

  // Fix #5: Consolidation — move items from last truck to earlier ones
  return consolidateTrucks(trucks);
}

/**
 * Post-processing: try to move items from the last (least-filled) truck
 * into earlier trucks to minimize truck count.
 */
function consolidateTrucks(trucks: TruckLoad[]): TruckLoad[] {
  if (trucks.length <= 1) return trucks;

  const lastTruck = trucks[trucks.length - 1];
  // Process from top of stack first (highest stackLevel, then highest z)
  const sortedItems = [...lastTruck.items].sort((a, b) => {
    if (a.stackLevel !== b.stackLevel) return b.stackLevel - a.stackLevel;
    return b.position.z - a.position.z;
  });

  for (const item of sortedItems) {
    const packItem: PackItem = {
      reference: item.reference,
      name: item.name,
      longueur: item.longueur,
      largeur: item.largeur,
      hauteur: item.hauteur,
      poids: item.poids,
      volume: item.volume,
      stackable: item.stackable,
      maxStackLevels: item.maxStackLevels,
      orientationConstraint: item.orientationConstraint,
      color: item.color,
    };

    for (let i = 0; i < trucks.length - 1; i++) {
      if (trucks[i].currentWeight + item.poids > TRUCK.maxWeight) continue;
      if (tryPlace(trucks[i], packItem)) {
        const idx = lastTruck.items.indexOf(item);
        if (idx > -1) {
          lastTruck.items.splice(idx, 1);
          lastTruck.currentWeight -= item.poids;
        }
        break;
      }
    }
  }

  return trucks.filter((t) => t.items.length > 0);
}
