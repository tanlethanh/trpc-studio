import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type AppParamsType = typeof AppParams;

type ParamValue = string | null;

type NestedParams = {
    [K in keyof AppParamsType]: NestedValue<AppParamsType[K]>;
};

type NestedValue<T> = T extends object
    ? { [P in keyof T]: NestedValue<T[P]> }
    : ParamValue;

type NestedRecord = {
    [key: string]: ParamValue | NestedRecord;
};

export const AppParams = {
    tab: {
        result: null,
        history: null,
        introspection: {
            introspection: {
                all: null,
                queries: null,
                mutations: null,
                subscriptions: null
            },
            procedure: null,
        }
    }
} as const;

type Join<K, P> = K extends string | number ?
    P extends string | number ?
        `${K}${'' extends P ? '' : '.'}${P}`
        : never : never;

type Paths<T, D extends number = 10> = [D] extends [never] ? never : T extends object ?
    { [K in keyof T]-?: K extends string | number ?
        `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never
    }[keyof T] : '';

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

type Path = Paths<typeof AppParams>;

type GetValueType<T, P extends string> = P extends keyof T ? 
    T[P] extends null ? string | null :
    T[P] extends object ? keyof T[P] :
    T[P] :
    P extends `${infer K}.${infer R}` ? K extends keyof T ? GetValueType<T[K], R> : never : never;

export function useAppParams<P extends Path>(path: P): {
    value: GetValueType<typeof AppParams, P>;
    setValue: (value: GetValueType<typeof AppParams, P>) => void;
} {
    const searchParams = useSearchParams();
    const key = useMemo(() => path.split('.').pop(), [path]);

    const value = useMemo(() => {
        return searchParams.get(key as string)
    }, [searchParams, key])

    const setValue = useCallback((value: GetValueType<typeof AppParams, P>) => {
        const params = new URLSearchParams(searchParams);
        const siblings = path.split('.').slice(0, -1).join('.');

        const cleanChildren = (path: string) => {
            const paths = path.split('.');
            const parent = paths.slice(0, -1).join('.');
            params.delete(parent);

            const nested = paths.reduce((acc: NestedRecord, curr) => {
                if (acc[curr as keyof typeof acc]) {
                    return acc[curr as keyof typeof acc] as NestedRecord;
                } else {
                    return acc[curr] = {};
                }
            }, AppParams);

            for (const [key, value] of Object.entries(nested)) {
                if (typeof value === 'object') {
                    params.delete(key);
                    cleanChildren(key);
                } 
            }

            return nested;
        }

        for (const sibling of siblings.split('.')) {
            cleanChildren(sibling);
        }

        const prev = params.get(key as string);
        if (prev) {
            params.delete(key as string);
        }

        params.set(key as string, value as string);
    }, [searchParams, path, key])

    return {
        value: value as GetValueType<typeof AppParams, P>,
        setValue
    };
}