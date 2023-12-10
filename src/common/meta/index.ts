import { BuildingDefinition, NameRecord, LocationRecord } from './location';

export type NaiveLocationMap = Record<string, readonly [string, number, number]>;

const buildNameMap = (building: BuildingDefinition, target?: NaiveLocationMap, prefix?: string, en?: boolean) => {
  target = target ?? Object.create(null) as Record<string, readonly [string, number, number]>;
  const realName = (prefix ?? '') + (en ? building.nameEn : building.nameJa);
  for (const floor of building.floors ?? []) {
    const value: readonly [string, number, number] = Object.freeze([
      realName + ` ${floor.name}F`, building.center.lon, building.center.lat
    ]);
    for (const room of floor.rooms) {
      target[room.new] = value;
      if (room.old){
        target[room.old] = value;
        target[`${room.new}(${room.old})`] = value;
      }
    }
  }
  return target;
};

export const LocationMap: NaiveLocationMap = Object.create(null);
export const LocationMapEn: NaiveLocationMap = Object.create(null);

for (const loc in LocationRecord) {
  const buildings = LocationRecord[loc] ?? [];
  const [pEn, pJa] = NameRecord[loc] ?? [loc + ' ', loc + ' '];
  for (const b of buildings) {
    buildNameMap(b, LocationMap, pJa, false);
    buildNameMap(b, LocationMapEn, pEn, true);
  }
}

Object.freeze(LocationMap);
Object.create(LocationMapEn);

