

export interface State<TData> {
    data: TData | null
    loading: boolean
    error: boolean
}

export const initialState = {
    data: null,
    loading: false,
    error: false,     
}

type Action<TData> = 
    | { type: 'FETCH' }
    | { type: 'FETCH_SUCCESS', payload: TData }
    | { type: 'FETCH_ERROR' }

export const fetchReducer = <TData>() => (state: State<TData>, action: Action<TData>): State<TData> => {
    switch (action.type) {
        case 'FETCH':
            return { ...state, loading: true }
        case 'FETCH_SUCCESS':
            return { data: action.payload, loading: false, error: false }
        case 'FETCH_ERROR':
            return { data: null, loading: false, error: true } 
    }
}

//const reducer = fetchReducer<TData>()
//const [state, dispatch] = useReducer(reducer, initialState)
