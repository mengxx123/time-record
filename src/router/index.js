import Vue from 'vue'
import Router from 'vue-router'

const Home = resolve => require(['@/views/Home'], resolve)
const Detail = resolve => require(['@/views/Detail'], resolve)
const Add = resolve => require(['@/views/Add'], resolve)
const Notice = resolve => require(['@/views/Notice'], resolve)
const Record = resolve => require(['@/views/Record'], resolve)
const Search = resolve => require(['@/views/Search'], resolve)
const RecordDetail = resolve => require(['@/views/RecordDetail'], resolve)
const RecordAdd = resolve => require(['@/views/RecordAdd'], resolve)
const RecordStat = resolve => require(['@/views/RecordStat'], resolve)
const Stat = resolve => require(['@/views/Stat'], resolve)
const Timeline = resolve => require(['@/views/Timeline'], resolve)
const Login = resolve => require(['@/views/Login'], resolve)
const Error404 = resolve => require(['@/views/error/Error404'], resolve)
const OauthCallback = resolve => require(['@/views/oauth/Callback'], resolve)

Vue.use(Router)

let routes = [
    {
        path: '/',
        redirect: '/home'
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
        path: '/records/:id',
        component: Detail
    },
    {
        path: '/users/:id',
        component: Record
    },
    {
        path: '/record',
        component: Record
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
        path: '/records2/:id',
        component: RecordDetail
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
