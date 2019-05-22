<template>
    <my-page title="搜索" backable>
        <div class="common-container" v-if="$store.state.user">
            <a href="javascript:;" v-if="!$store.state.user" @click="login">点击登陆</a>
            <ui-text-field v-model="keyword" label="关键词" />
            <br>
            <ui-raised-button @click="search">搜索</ui-raised-button>
            <h2 class="section—title">搜索结果（{{ records.length }}）</h2>
            <div class="empty" v-if="!records.length">没有记录</div>
            <ul class="record-list">
                <li class="item" v-for="item, index in records" :key="index">
                    <router-link :to="`/records/${item.id}`">
                        <div class="content">{{ item.content }}（{{ item.value }}）</div>
                    </router-link>
                    <div class="time">
                        {{ item.startTime | time }}
                        （星期{{ item.week }}，{{ item.dayAgo }} 天前）
                    </div>
                    <div class="time" v-if="item.duration">{{ item.duration | duration }}</div>
                    <div @click="remove(item, index)">删除</div>
                    <div @click="finish(item, index)" v-if="!item.duration">刚刚完成</div>
                </li>
            </ul>
        </div>
    </my-page>
</template>

<script>
    import oss from '@/util/oss'
    const moment = window.moment

    export default {
        data () {
            return {
                records: [],
                page: {
                    menu: [
                        // {
                        //     type: 'icon',
                        //     icon: 'search',
                        //     to: '/record/search',
                        //     title: '搜索'
                        // }
                    ]
                }
            }
        },
        mounted() {
            let { keyword } = this.$route.query
            if (!keyword) {
                return
            }
            this.keyword = keyword
            this.$http.get(`/records?keyword=${encodeURIComponent(this.keyword)}`).then(
                response => {
                    let data = response.data
                    console.log(data)
                    this.records = data.map(item => {
                        let weeks = '日一二三四五六'.split('')
                        const DAY = 24 * 3600 * 1000
                        return {
                            ...item,
                            week: weeks[moment(item.startTime).day()],
                            dayAgo: Math.floor((moment().startOf('day').toDate().getTime() - moment(item.startTime).startOf('day').toDate().getTime()) / DAY)
                        }
                    })
                },
                response => {
                    console.log('cuol')
                    if (response.code === 403) {
                        this.$store.state.user = null
                    }
                    this.loading = false
                })
        },
        methods: {
            search() {
                if (!this.keyword) {
                    this.$message({
                        type: 'danger',
                        text: '请输入关键词'
                    })
                    return
                }
                this.$router.push('/search?keyword=' + encodeURIComponent(this.keyword))
            },
            view(item, index) {
                this.$router.push(`/records/${item.id}`)
            },
            add() {
                this.$router.push('/record/add')
            },
            sign(item, index) {
                this.list[index].times++
                this.list[index].lastTime = new Date().getTime()
                this.list[index].updateTime = new Date().getTime()
                this.$storage.set('list', this.list)
                let logs = this.$storage.get('logs', [])
                logs.unshift({
                    id: '' + new Date().getTime(),
                    taskId: this.list[index].id,
                    time: new Date().getTime(),
                    createTime: new Date().getTime(),
                    updateTime: new Date().getTime()
                })
                this.$storage.set('logs', logs)
            },
            remove(item, index) {
                let ret = window.confirm(`确认删除 ${item.content}？`)
                if (!ret) {
                    return
                }
                this.$http.delete(`/records/${item.id}`).then(
                    response => {
                        let data = response.data
                        console.log(data)
                        this.loadData()
                    },
                    response => {
                        console.log(response)
                        this.loading = false
                    })
            },
            finish(item, index) {
                // let ret = window.confirm(`确认完成 ${item.content}？`)
                // if (!ret) {
                //     return
                // }
                let endTime = moment().format('YYYY-MM-DD HH:mm:ss')
                let duration = (new Date().getTime() - moment(item.startTime).toDate().getTime()) / 1000
                console.log(duration)
                // return
                this.$http.put(`/records/${item.id}`, {
                    ...item,
                    endTime,
                    duration
                }).then(
                    response => {
                        let data = response.data
                        console.log(data)
                        this.loadData()
                    },
                    response => {
                        console.log(response)
                        this.loading = false
                    })
            },
            quickAdd(item) {
                this.$http.post(`/records`, {
                    content: item
                }).then(
                    response => {
                        let data = response.data
                        console.log(data)
                        // this.$router.go(-1)
                        this.loadData()
                    },
                    response => {
                        console.log(response)
                        this.loading = false
                    })
            },
            viewTodayBefore() {
                this.$router.push(`/users/1?date=${moment().subtract(1, 'days').format('YYYY-MM-DD')}`)
            },
            viewToday() {
                this.$router.push(`/users/1`)
            },
            viewTodayAfter() {
                this.$router.push(`/users/1?date=${moment().add(1, 'days').format('YYYY-MM-DD')}`)
            },
            login() {
                location.href = oss.getOauthUrl()
            }
        },
        filters: {
            time(value) {
                if (!value) {
                    return '--'
                }
                return moment(new Date(value)).format('YYYY-MM-DD HH:mm')
            },
            duration(value) {
                return Math.ceil(value / 60) + '分钟'
            }
        }
    }
</script>

<style lang="scss" scoped>
.simple-login-box {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .12);
}
.conteiner {
    max-width: 400px;
    margin: 0 auto;
}
.section—title {
    font-size: 24px;
    margin: 16px 0;
}
.quick-list {
    display: flex;
    flex-wrap: wrap;
    .item {
        padding: 4px 8px;
        margin-right: 8px;
        margin-bottom: 8px;
        border: 1px solid #000;
        cursor: pointer;
    }
}
.record-list {
    .item {
        // display: flex;
        // justify-content: space-between;
        padding: 16px 0;
        border-bottom: 1px solid rgba(0, 0, 0, .12);
    }
    .title {
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
    }
    .times {
        color: #666;
        cursor: pointer;
    }
}
.float-button {
    position: fixed;
    right: 24px;
    bottom: 24px;
}
.float-button2 {
    position: fixed;
    left: 24px;
    bottom: 24px;
}
.sign {
    margin-bottom: 8px;
}
.empty {
    .text {
        color: #999;
        padding: 80px 0;
        text-align: center;
    }
}
</style>
