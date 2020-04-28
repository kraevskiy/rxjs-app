import * as Rx from 'rxjs'
import * as operator from "rxjs/operators"
import {fromFetch} from "rxjs/fetch"
import {CLIEANT_ID, CLIEANT_SECRET} from '../../env'

const c_id = `&client_id=${CLIEANT_ID}`
const c_secret = `&client_secret=${CLIEANT_SECRET}`
const userUrl = (id) => `https://api.github.com/search/users?q=${id}${c_id}${c_secret}`

Rx.fromEvent(document.querySelector('input'), 'keyup')
  .pipe(
    operator.pluck('target', 'value'),
    operator.distinct(),
    operator.debounceTime(2000),
    operator.mergeMap(v => {
      return fromFetch(userUrl(v)).
        pipe(
          operator.switchMap(res => {
            if(res.ok) return res.json()
            return Rx.of({error: true, message: `Error ${res.title}`})
          })
      )
    }),
    operator.catchError('Some errors not found'),
    operator.map(x => x.items[0])
  )
  .subscribe(
    user => {
      document.querySelector('h1').innerHTML = user.login
      document.querySelector('img').setAttribute('src', user.avatar_url)
    },
    error => console.log(error),
    () => console.log('completed')
  )