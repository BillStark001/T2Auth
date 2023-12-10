
export type FloorDefinition = {
  name: string,
  rooms: { old?: string, new: string }[],
};

export type BuildingDefinition = {
  nameJa: string,
  nameEn: string,
  center: {
    lat: number,
    lon: number,
  },
  floors?: FloorDefinition[];
};

export const NameRecord: Record<string, readonly string[]> = Object.freeze({
  'ookayama': ['Ookayama ', '大岡山'],
  'suzukakedai': ['Suzukakedai ', 'すずかけ台'],
  'tamachi': ['Tamachi ', '田町'],
});

export const LocationRecord: Record<string, readonly BuildingDefinition[]> = Object.freeze({
  'ookayama': [
    {
      nameJa: '本館',
      nameEn: 'Main Bldg.',
      center: {
        lat: 35.6044546,
        lon: 139.6838463
      },
      floors: [
        {
          name: 'B1',
          rooms: [
            { old: 'H101', new: 'M-B07' },
            { old: 'H105', new: 'M-B45' },
            { old: 'H106', new: 'M-B43' }
          ]
        },
        {
          name: '1',
          rooms: [
            { old: 'H111', new: 'M-123' },
            { old: 'H112', new: 'M-110' },
            { old: 'H113', new: 'M-107' },
            { old: 'H114', new: 'M-103' },
            { old: 'H115', new: 'M-102' },
            { old: 'H116', new: 'M-101' },
            { old: 'H117', new: 'M-112' },
            { old: 'H118', new: 'M-119' },
            { old: 'H119A', new: 'M-143A' },
            { old: 'H119B', new: 'M-143B' },
            { old: 'H1101', new: 'M-178' },
            { old: 'H1102', new: 'M-157' },
            { old: 'H1103', new: 'M-156' },
            { old: 'H1104', new: 'M-155' },
            { new: 'M-124' },
            { new: 'M-134' },
            { new: 'M-135' }
          ]
        },
        {
          name: '2',
          rooms: [
            { old: 'H121', new: 'M-278' }
          ]
        },
        {
          name: '3',
          rooms: [
            { old: 'H131', new: 'M-374' },
            { old: 'H132', new: 'M-356' }
          ]
        }
      ]
    },
    {
      nameJa: '本館講義棟',
      nameEn: 'Main Bldg. Lecture Hall',
      center: {
        lat: 35.6044546,
        lon: 139.6838463
      },
      floors: [
        {
          name: '1',
          rooms: [
            { old: 'H102', new: 'M-B101' },
            { old: 'H103', new: 'M-B104' },
            { old: 'H104', new: 'M-B107' }
          ]
        }
      ]
    },
    {
      nameJa: '⻄1号館',
      nameEn: 'West Bldg.1',
      center: {
        lat: 35.6053740,
        lon: 139.6828425
      },
      floors: [
        {
          name: '1',
          rooms: [
            { old: 'W111', new: 'W1-102' },
            { old: 'W112', new: 'W1-104' },
            { old: 'W113', new: 'W1-109' },
            { old: 'W114', new: 'W1-111' }
          ]
        }
      ]
    },
    {
      nameJa: '⻄2号館',
      nameEn: 'West Bldg.2',
      center: {
        lat: 35.6046255,
        lon: 139.6828080
      },
      floors: [
        {
          name: '4',
          rooms: [
            { old: 'W241', new: 'W2-401' },
            { old: 'W242', new: 'W2-402' }
          ]
        }
      ]
    },
    {
      nameJa: '⻄3号館',
      nameEn: 'West Bldg.3',
      center: {
        lat: 35.6046308,
        lon: 139.6825642
      },
      floors: [
        {
          name: '2',
          rooms: [
            { old: 'W321', new: 'W3-201' },
            { old: 'W322', new: 'W3-205' },
            { old: 'W323', new: 'W3-207' }
          ]
        },
        {
          name: '3',
          rooms: [
            { old: 'W331', new: 'W3-301' },
            { old: 'W332', new: 'W3-305' }
          ]
        },
        {
          name: '5',
          rooms: [
            { old: 'W351', new: 'W3-501' }
          ]
        },
        {
          name: '7',
          rooms: [
            { old: 'W371', new: 'W3-707' }
          ]
        }
      ]
    },
    {
      nameJa: '⻄4号館',
      nameEn: 'West Bldg.4',
      center: {
        lat: 35.6043413,
        lon: 139.6826800
      }
    },
    {
      nameJa: '⻄5号館',
      nameEn: 'West Bldg.5',
      center: {
        lat: 35.6062122,
        lon: 139.6827839
      },
      floors: [
        {
          name: '1',
          rooms: [
            { new: 'W5-104' },
            { new: 'W5-105' },
            { new: 'W5-106' },
            { new: 'W5-107' }
          ]
        }
      ]
    },
    {
      nameJa: '⻄講義棟1',
      nameEn: 'West Lecture Bldg.1',
      center: {
        lat: 35.6045926,
        lon: 139.6823014
      },
      floors: [
        { name: '2', rooms: [{ old: 'W521', new: 'WL1-201' }] },
        { name: '3', rooms: [{ old: 'W531', new: 'WL1-301' }] },
        { name: '4', rooms: [{ old: 'W541', new: 'WL1-401' }] }
      ]
    },
    {
      nameJa: '⻄講義棟2',
      nameEn: 'West Lecture Bldg.2',
      center: {
        lat: 35.6043795,
        lon: 139.6822899
      },
      floors: [
        { name: '1', rooms: [{ old: 'W611', new: 'WL2-101' }] },
        { name: '2', rooms: [{ old: 'W621', new: 'WL2-201' }] },
        { name: '3', rooms: [{ old: 'W631', new: 'WL2-301' }] },
        { name: '4', rooms: [{ old: 'W641', new: 'WL2-401' }] }
      ]
    },
    {
      nameJa: '⻄7号館',
      nameEn: 'West Bldg.7',
      center: {
        lat: 35.6041086,
        lon: 139.6826851
      }
    },
    {
      nameJa: '⻄8号館E棟',
      nameEn: 'West Bldg.8E',
      center: {
        lat: 35.6049384,
        lon: 139.6826061
      },
      floors: [
        { name: '1', rooms: [{ new: 'W8E-101' }] },
        {
          name: '3', rooms: [
            { old: 'W832', new: 'W8E-306' },
            { old: 'W833', new: 'W8E-307' },
            { old: 'W834', new: 'W8E-308' }
          ]
        }
      ]
    },
    {
      nameJa: '⻄8号館W棟',
      nameEn: 'West Bldg.8W',
      center: {
        lat: 35.6048085,
        lon: 139.6821203
      }
    },
    {
      nameJa: '⻄9号館',
      nameEn: 'West Bldg.9',
      center: {
        lat: 35.6058501,
        lon: 139.6826498
      },
      floors: [
        { name: '2', rooms: [{ old: 'W921', new: 'W9-201' }, { old: 'W922', new: 'W9-202' }] },
        {
          name: '3', rooms: [
            { old: 'W931', new: 'W9-322' },
            { old: 'W932', new: 'W9-323' },
            { old: 'W933', new: 'W9-324' },
            { old: 'W934', new: 'W9-325' },
            { old: 'W935', new: 'W9-326' },
            { old: 'W936', new: 'W9-327' },
            { old: 'W937', new: 'W9-321' }
          ]
        }
      ]
    },
    {
      nameJa: '南講義棟',
      nameEn: 'South Lecture Bldg.',
      center: {
        lat: 35.6024449,
        lon: 139.6841415
      },
      floors: [
        { name: '1', rooms: [{ old: 'S011', new: 'SL-101' }] }
      ]
    },
    {
      nameJa: '南1号館',
      nameEn: 'South Bldg.1',
      center: {
        lat: 35.6036557,
        lon: 139.6834040
      }
    },
    {
      nameJa: '南2号館',
      nameEn: 'South Bldg.2',
      center: {
        lat: 35.6030067,
        lon: 139.6841999
      },
      floors: [
        {
          name: '2', rooms: [
            { old: 'S221', new: 'S2-204' },
            { old: 'S222', new: 'S2-203' },
            { old: 'S223', new: 'S2-202' },
            { old: 'S224', new: 'S2-201' }
          ]
        }
      ]
    },
    {
      nameJa: '南3号館',
      nameEn: 'South Bldg.3',
      center: {
        lat: 35.6031370,
        lon: 139.6839328
      },
      floors: [
        {
          name: '2', rooms: [
            { old: 'S321', new: 'S3-215' },
            { old: 'S322', new: 'S3-207' },
            { old: 'S323', new: 'S3-206' }
          ]
        }
      ]
    },
    {
      nameJa: '南4号館',
      nameEn: 'South Bldg.4',
      center: {
        lat: 35.6033451,
        lon: 139.6842513
      },
      floors: [
        {
          name: '2', rooms: [
            { old: 'S421', new: 'S4-201' },
            { old: 'S422', new: 'S4-202' },
            { old: 'S423', new: 'S4-203' }
          ]
        }
      ]
    },
    {
      nameJa: '南5号館',
      nameEn: 'South Bldg.5',
      center: {
        lat: 35.6026327,
        lon: 139.6838470
      }
    },
    {
      nameJa: '南6号館',
      nameEn: 'South Bldg.6',
      center: {
        lat: 35.6026192,
        lon: 139.6845096
      },
      floors: [
        { name: '1', rooms: [{ old: 'S611', new: 'S6-109' }] },
        { name: '2', rooms: [{ old: 'S621', new: 'S6-219' }, { old: 'S622', new: 'S6-211' }] }
      ]
    },
    {
      nameJa: '南7号館',
      nameEn: 'South Bldg.7',
      center: {
        lat: 35.6034210,
        lon: 139.6832407
      }
    },
    {
      nameJa: '南8号館',
      nameEn: 'South Bldg.8',
      center: {
        lat: 35.6031450,
        lon: 139.6834478
      }
    },
    {
      nameJa: '南9号館',
      nameEn: 'South Bldg.9',
      center: {
        lat: 35.6028946,
        lon: 139.6835928
      }
    },
    {
      nameJa: '⽯川台1号館',
      nameEn: 'Ishikawadai Bldg.1',
      center: {
        lat: 35.6011306,
        lon: 139.6844689
      },
      floors: [
        {
          name: '2', rooms: [
            { old: 'I121', new: 'I1-256' },
            { old: 'I123', new: 'I1-255' },
            { old: 'I124', new: 'I1-254' }
          ]
        }
      ]
    },
    {
      nameJa: '⽯川台2号館',
      nameEn: 'Ishikawadai Bldg.2',
      center: {
        lat: 35.6016297,
        lon: 139.6843021
      }
    },
    {
      nameJa: '⽯川台3号館',
      nameEn: 'Ishikawadai Bldg.3',
      center: {
        lat: 35.6015447,
        lon: 139.6848870
      },
      floors: [
        { name: '1', rooms: [{ old: 'I311', new: 'I3-107' }] },
        { name: '2', rooms: [{ old: 'I321', new: 'I3-203' }] }
      ]
    },
    {
      nameJa: '⽯川台4号館',
      nameEn: 'Ishikawadai Bldg.4',
      center: {
        lat: 35.6010901,
        lon: 139.6850098
      }
    },
    {
      nameJa: '⽯川台5号館',
      nameEn: 'Ishikawadai Bldg.5',
      center: {
        lat: 35.6007380,
        lon: 139.6845711
      }
    },
    {
      nameJa: '⽯川台6号館',
      nameEn: 'Ishikawadai Bldg.6',
      center: {
        lat: 35.6007164,
        lon: 139.6841192
      }
    },
    {
      nameJa: '石川台実験棟1',
      nameEn: 'Ishikawadai Expr.Bldg.1',
      center: {
        lat: 35.6016399,
        lon: 139.6842457
      }
    }
  ],
  'suzukakedai': [
    {
      nameJa: 'B1・B2棟',
      nameEn: 'B1B2 Bldg.',
      center: {
        lat: 35.5135632,
        lon: 139.4818679
      },
      floors: [
        {
          name: '2',
          rooms: [
            { old: 'B221', new: 'B2-223' },
            { old: 'B222', new: 'B2-225' },
            { old: 'B223', new: 'B2-227' },
            { old: 'B224', new: 'B2-222' },
            { old: 'B225', new: 'B2-224' },
            { old: 'B226', new: 'B2-226' }
          ]
        }
      ]
    },
    {
      nameJa: 'G1棟',
      nameEn: 'G1 Bldg.',
      center: {
        lat: 35.5135743,
        lon: 139.4833941
      },
      floors: [
        {
          name: '1',
          rooms: [
            { old: 'G111', new: 'G1-102' },
            { old: 'G112', new: 'G1-106' },
            { old: 'G113', new: 'G1-110' },
            { old: 'G114', new: 'G1-103' },
            { old: 'G115', new: 'G1-109' }
          ]
        }
      ]
    },
    {
      nameJa: 'G2棟',
      nameEn: 'G2 Bldg.',
      center: {
        lat: 35.5127854,
        lon: 139.4844973
      },
      floors: [
        {
          name: '2',
          rooms: [
            { old: 'G221', new: 'G2-202' },
            { old: 'G223', new: 'G2-201' },
            { old: 'G224', new: 'G2-209' }
          ]
        }
      ]
    },
    {
      nameJa: 'G3棟',
      nameEn: 'G3 Bldg.',
      center: {
        lat: 35.5124213,
        lon: 139.4850636
      },
      floors: [
        {
          name: '1',
          rooms: [
            { old: 'G311', new: 'G3-117' }
          ]
        },
        {
          name: '2',
          rooms: [
            { old: 'G321', new: 'G3-202' },
            { old: 'G323', new: 'G3-201' },
            { old: 'G324', new: 'G3-207' }
          ]
        }
      ]
    },
    {
      nameJa: 'G5棟',
      nameEn: 'G5 Bldg.',
      center: {
        lat: 35.5124287,
        lon: 139.4845525
      },
      floors: [
        {
          name: '1',
          rooms: [
            { old: 'G511', new: 'G5-105' },
            { old: 'G512', new: 'G5-104' }
          ]
        }
      ]
    },
    {
      nameJa: 'J2・J3棟',
      nameEn: 'J2-J3 Bldg.',
      center: {
        lat: 35.5129805,
        lon: 139.4834128
      },
      floors: [
        {
          name: '2',
          rooms: [
            { old: 'J221', new: 'J2-203' }
          ]
        },
        {
          name: '3',
          rooms: [
            { old: 'J231', new: 'J2-304' },
            { old: 'J232', new: 'J2-305' },
            { old: 'J233', new: 'J2-302' },
            { old: 'J234', new: 'J2-303' }
          ]
        },
        {
          name: '12',
          rooms: [
            { old: 'J2121', new: 'J2-1207' }
          ]
        }
      ]
    }
  ]
});