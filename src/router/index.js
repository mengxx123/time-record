import Vue from 'vue'
import Router from 'vue-router'

const Home = resolve => require(['@/views/Home'], resolve)
const Detail = resolve => require(['@/views/Detail'], resolve)
const Add = resolve => require(['@/views/Add'], resolve)
const Notice = resolve => require(['@/views/Notice'], resolve)
const RecordHome = resolve => require(['@/views/RecordHome'], resolve)
const Record = resolve => require(['@/views/Record'], resolve)
const Search = resolve => require(['@/views/Search'], resolve)
const RecordDetail = resolve => require(['@/views/RecordDetail'], resolve)
const RecordEdit = resolve => require(['@/views/RecordEdit'], resolve)
const RecordAdd = resolve => require(['@/views/RecordAdd'], resolve)
const RecordStat = resolve => require(['@/views/RecordStat'], resolve)
const Stat = resolve => require(['@/views/Stat'], resolve)
const Timeline = resolve => require(['@/views/Timeline'], resolve)
const Login = resolve => require(['@/views/Login'], resolve)

const MyObject = resolve => require(['@/views/MyObject'], resolve)
const ObjectDetail = resolve => require(['@/views/ObjectDetail'], resolve)
const ObjectEdit = resolve => require(['@/views/ObjectEdit'], resolve)
const ObjectQrcode = resolve => require(['@/views/ObjectQrcode'], resolve)

const Eat = resolve => require(['@/views/Eat'], resolve)
const EatList = resolve => require(['@/views/EatList'], resolve)
const EatDetail = resolve => require(['@/views/EatDetail'], resolve)
const EatEdit = resolve => require(['@/views/EatEdit'], resolve)

const Acg = resolve => require(['@/views/Acg'], resolve)
const AcgEdit = resolve => require(['@/views/AcgEdit'], resolve)
const AcgDetail = resolve => require(['@/views/AcgDetail'], resolve)

const Position = resolve => require(['@/views/Position'], resolve)
const PositionDetail = resolve => require(['@/views/PositionDetail'], resolve)
const PositionEdit = resolve => require(['@/views/PositionEdit'], resolve)

const Error404 = resolve => require(['@/views/error/Error404'], resolve)
const OauthCallback = resolve => require(['@/views/oauth/Callback'], resolve)

Vue.use(Router)

const Location = resolve => require(['@/views/Location'], resolve)
const LocationEdit = resolve => require(['@/views/LocationEdit'], resolve)
const LocationDetail = resolve => require(['@/views/LocationDetail'], resolve)
let locationRouters = [
    {
        path: '/location',
        component: Location
    },
    {
        path: '/location/add',
        component: LocationEdit
    },
    {
        path: '/locations/:id',
        component: LocationDetail
    },
    {
        path: '/locations/:id/edit',
        component: LocationEdit
    },
]

const Today = resolve => require(['@/views/Today'], resolve)
const TodayEdit = resolve => require(['@/views/TodayEdit'], resolve)
const TodayDetail = resolve => require(['@/views/TodayDetail'], resolve)
const TodayList = resolve => require(['@/views/TodayList'], resolve)
const TodayStat = resolve => require(['@/views/TodayStat'], resolve)

let dateRouters = [
    {
        path: '/today',
        component: Today
    },
    {
        path: '/today/list',
        component: TodayList
    },
    {
        path: '/today/stat',
        component: TodayStat
    },
    {
        path: '/date/add',
        component: TodayEdit
    },
    {
        path: '/dates/:id',
        component: TodayDetail
    },
    {
        path: '/dates/:id/edit',
        component: TodayEdit
    },
]

let routes = [
    ...locationRouters,
    ...dateRouters,
    {
        path: '/',
        redirect: '/record'
        // component: Home
    },
    {
        path: '/home',
        component: Home
    },
    {
        path: '/search',
        component: Search
    },
    {
        path: '/record1/:id',
        component: Detail
    },
    {
        path: '/users/:id',
        component: Record
    },
    {
        path: '/record',
        component: RecordHome
    },
    {
        path: '/records',
        component: Record
    },
    {
        path: '/objects',
        component: MyObject
    },
    {
        path: '/eat',
        component: Eat
    },
    {
        path: '/eat/list',
        component: EatList
    },
    {
        path: '/eats/:id',
        component: EatDetail
    },
    {
        path: '/eats/:id/edit',
        component: EatEdit
    },
    {
        path: '/eats/add',
        component: EatEdit
    },
    {
        path: '/objects/:id',
        component: ObjectDetail
    },
    {
        path: '/objects/:id/edit',
        component: ObjectEdit
    },
    {
        path: '/objects/:id/qrcode',
        component: ObjectQrcode
    },
    {
        path: '/object/add',
        component: ObjectEdit
    },
    {
        path: '/positions',
        component: Position
    },
    {
        path: '/positions/:id',
        component: PositionDetail
    },
    {
        path: '/positions/:id/edit',
        component: PositionEdit
    },
    {
        path: '/position/add',
        component: PositionEdit
    },

    {
        path: '/notice',
        component: Notice
    },
    {
        path: '/record/add',
        component: RecordAdd
    },
    {
        path: '/records/:id',
        component: RecordDetail
    },
    {
        path: '/records/:id/edit',
        component: RecordEdit
    },
    {
        path: '/record/stat',
        component: RecordStat
    },
    {
        path: '/stat',
        component: Stat
    },
    {
        path: '/add',
        component: Add
    },
    {
        path: '/timeline',
        component: Timeline
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/acg',
        component: Acg
    },
    {
        path: '/acg/add',
        component: AcgEdit
    },
    {
        path: '/acgs/:id/edit',
        component: AcgEdit
    },
    {
        path: '/acgs/:id',
        component: AcgDetail
    },
    {
        path: '/oauth/callback',
        component: OauthCallback
    },
    {
        path: '*',
        component: Error404
    }
]

let router = new Router({
    mode: 'history',
    routes: routes,
    scrollBehavior (to, from, savedPosition) {
        return {
            x: 0,
            y: 0
        }
    }
})

export default router
