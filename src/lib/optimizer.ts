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
        const maxLevels = support.maxStackLevels ?? 2;
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

  items.sort((a, b) => b.volume - a.volume);

  const trucks: TruckLoad[] = [];

  for (const item of items) {
    let placed = false;

    for (const truck of trucks) {
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
        newTruck.items.push({
          ...item,
          position: { x: 0, y: 0, z: 0 },
          dims: { l: item.longueur, w: item.largeur, h: item.hauteur },
          color: item.color,
          stackLevel: 0,
        });
        newTruck.currentWeight += item.poids;
        trucks.push(newTruck);
      }
    }
  }

  return trucks;
}
