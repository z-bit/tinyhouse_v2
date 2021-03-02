import { 
//    useState, 
    useReducer
} from 'react'
import { server } from './server'
import { fetchReducer, initialState } from './fetchReducer'

type MutationTuple<TVars> = [
    deleteListing: (vars?: TVars | undefined) => Promise<void>,
    dlLoading: boolean,
    dlError: boolean,
]

export const useMutation = 
    <TData = any, TVars = any>(query: string): MutationTuple<TVars> => {

    //const [state, setState] = useState<State<TData>>(initialState)
    const reducer = fetchReducer<TData>()
    const [state, dispatch] = useReducer(reducer, initialState)

    const fetch = async (variables?: TVars) => {
       
        try {
            //setState({ data: null, loading: true, error: false })
            dispatch({ type: 'FETCH'})

            const { data, errors } = 
                await server.fetch<TData, TVars>({ query, variables })

            if (errors && errors.length) {
                throw new Error(errors[0].message)
            }

            //setState({ data, loading: false, error: false })
            dispatch({ type: 'FETCH_SUCCESS', payload: data })
        } catch (err) {
            //setState({ data: null, loading: false, error: true })
            dispatch({ type: 'FETCH_ERROR' })
            throw console.error(err)
        }
    }

    return [fetch, state.loading, state.error]
}


// gone to fetchReducer.ts
// interface State<TData> {
//     data: TData | null
//     loading: boolean
//     error: boolean
// }
// const initialState = {
//     data: null,
//     loading: false,
//     error: false,     
// }
// type Action<TData> = 
//     | { type: 'FETCH' }
//     | { type: 'FETCH_SUCCESS', payload: TData }
//     | { type: 'FETCH_ERROR' }

// const fetchReducer = <TData>() => (state: State<TData>, action: Action<TData>): State<TData> => {
//     switch (action.type) {
//         case 'FETCH':
//             return { ...state, loading: true }
//         case 'FETCH_SUCCESS':
//             return { data: action.payload, loading: false, error: false }
//         case 'FETCH_ERROR':
//             return { data: null, loading: false, error: true } 
//     }
// }