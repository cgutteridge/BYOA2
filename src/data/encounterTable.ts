// Default configuration
import {Encounter, LocationDifficulty, WeightedList} from "@/types";

export const encounterTable: Record<LocationDifficulty, WeightedList<Encounter>> = {
    'start': [
        {
            value: [{level: 'grunt', count: 1}],
            weight: 1
        }
    ]
    ,
    'easy': [
        {
            value: [{level: 'minion', count: 3}],
            weight: 1
        },
        {
            value: [
                {level: 'grunt', count: 1},
                {level: 'minion', count: 2}
            ],
            weight: 1
        },
        {
            value: [
                {level: 'grunt', count: 2},
                {level: 'minion', count: 1}
            ],
            weight: 1
        }
    ]
    ,
    'medium': [
        {
            value: [
                {level: 'minion', count: 2},
                {level: 'grunt', count: 2}
            ],
            weight: 1
        },
        {
            value: [{level: 'grunt', count: 3}],
            weight: 1
        },
        {
            value: [
                {level: 'elite', count: 1},
                {level: 'grunt', count: 1},
                {level: 'minion', count: 1}
            ],
            weight: 1
        },
        {
            value: [
                {level: 'elite', count: 1},
                {level: 'minion', count: 2}
            ],
            weight: 1
        },
        {
            value: [
                {level: 'elite', count: 3},
                {level: 'grunt', count: 1}
            ],
            weight: 1
        }
    ]
    ,
    'hard': [
        {
            value: [
                {level: 'elite', count: 1},
                {level: 'grunt', count: 2}
            ],
            weight: 1
        },
        {
            value: [
                {level: 'elite', count: 1},
                {level: 'grunt', count: 1},
                {level: 'minion', count: 2}
            ],
            weight: 1
        },
        {
            value: [
                {level: 'elite', count: 2},
                {level: 'grunt', count: 1}
            ],
            weight: 1
        },
        {
            value: [
                {level: 'elite', count: 2},
                {level: 'minion', count: 2}
            ],
            weight: 1
        }
    ],
    'end': [
        {
            value: [
                {level: 'boss', count: 1},
                {level: 'elite', count: 1},
                {level: 'grunt', count: 2}
            ],
            weight: 1
        },
        {
            value: [
                {level: 'boss', count: 1},
                {level: 'elite', count: 1},
                {level: 'minion', count: 3}
            ],
            weight: 1
        },
        {
            value: [
                {level: 'boss', count: 1},
                {level: 'elite', count: 2},
                {level: 'grunt', count: 1}
            ],
            weight: 1
        }
    ]

}
