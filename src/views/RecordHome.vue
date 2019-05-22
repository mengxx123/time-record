<template>
    <my-page title="时间记录" :page="page">
        <a href="javascript:;" v-if="!$store.state.user" @click="login">点击登陆</a>
        <!-- <div class="simple-login-box" v-if="!$store.state.user">
            <div>
                <ui-text-field v-model="email" label="邮箱/用户名" />
                <br>
                <ui-text-field v-model="email" label="邮箱/用户名" />
                <br>
                <ui-raised-button @click="login">登录</ui-raised-button>
            </div>
        </div> -->
        <div class="common-container" v-if="$store.state.user">
            <div class="section">
                <h2 class="section—title">进行中</h2>
                <!-- <li class="item" v-if="latestRecord">
                </li> -->
                <li class="empty" v-if="!latestRecord">没有进行中的记录</li>
                <ui-card v-if="latestRecord">
                    <!-- <ui-card-title title="进行中"/> -->
                    <ui-card-text>
                        <router-link :to="`/records/${latestRecord.id}`">
                        <div class="content">{{ latestRecord.content }}（{{ latestRecord.value }}）</div>
                    </router-link>
                    <div class="timer-time" v-if="!latestRecord.duration">用时：{{ timerTime }}</div>
                    <div class="time">{{ latestRecord.startTime | time }}</div>
                    <div class="time" v-if="latestRecord.duration">{{ latestRecord.duration | duration }}</div>
                    <!-- <div @click="remove(latestRecord, index)">删除</div> -->
                    <!-- <ui-raised-button label="结束" @click="finish(latestRecord, index)" v-if="!latestRecord.duration" /> -->
                    </ui-card-text>
                    <ui-card-actions>
                        <ui-flat-button label="结束" @click="finish(latestRecord, index)" v-if="!latestRecord.duration"/>
                        <ui-flat-button label="编辑" @click="to(`/records/${latestRecord.id}/edit`)"/>
                        <ui-flat-button label="删除" @click="remove(latestRecord, index)"/>
                    </ui-card-actions>
                </ui-card>
            </div>

            <div class="section">
                <h2 class="section—title">快速添加</h2>
                <div class="search-box">
                    <input class="input" v-model="input" placeholder="输入内容" @keydown="keyDown($event)">
                    <!-- <ui-icon-button icon="close" title="搜索" primary @click="input = ''" v-if="input" /> -->
                    <ui-icon-button icon="add" title="搜索" primary @click="quickAdd2" />
                </div>
                <ul class="quick-list">
                    <li class="item" v-for="item, index of quickActions" :key="index" @click="quickAdd(item)">{{ item }}</li>
                </ul>
            </div>

            <div class="section">
                <h2 class="section—title">应用推荐</h2>
                <ul class="app-list">
                    <li class="item" v-for="item in apps" :key="item.url">
                        <a class="link" :href="item.url" target="_blank">
                            <img class="icon" :src="item.icon">
                            <div class="name">{{ item.name }}</div>
                        </a>
                    </li>
                </ul>
            </div>

            <div class="section">
                <h2 class="section—title">统计</h2>
                <div>
                    <router-link to="/stat">更多统计信息</router-link>
                </div>
            </div>
        </div>
        <ui-float-button class="float-button" icon="add" secondary @click="add" />
    </my-page>
</template>

<script>
    /* eslint-disable */
    import oss from '@/util/oss'
    import { setInterval, clearInterval } from 'timers';
    const moment = window.moment

    export default {
        data () {
            return {
                input: '',
                apps: [
                    {
                        name: '记时',
                        icon: 'https://time.yunser.com/static/img/time.svg',
                        url: 'https://time.yunser.com/stopWatch'
                    },
                    {
                        name: '倒计时',
                        icon: 'https://time.yunser.com/static/img/time.svg',
                        url: 'https://time.yunser.com/countdown'
                    },
                    {
                        name: '吃什么',
                        icon: 'https://life.yunser.com/static/img/life.svg',
                        url: 'https://life.yunser.com/what_to_eat'
                    },
                    {
                        name: '计算器',
                        icon: 'https://calculator.yunser.com/static/img/calculator_simple.svg',
                        url: 'https://calculator.yunser.com/calculator'
                    },
                ],
                quickActions: [
                    '睡觉',
                    '午睡',
                    '通勤',
                    '工作',
                    '学习',
                    '吃早餐',
                    '吃午餐',
                    '吃晚餐',
                    '吃夜宵',
                    '休息',
                    '喝水',
                    '上厕所',
                    '刷牙',
                    '洗澡',
                    '运动',
                    '下班',
                ],
                latestRecord: null,
                totalTime: '0',
                timerTime: '-',
                page: {
                    menu: [
                        {
                            type: 'icon',
                            icon: 'list',
                            click: this.list,
                            title: '记录列表'
                        },
                        {
                            type: 'icon',
                            icon: 'search',
                            to: '/search',
                            title: '搜索'
                        }
                    ]
                }
            }
        },
        mounted() {
            console.log(this.$store)
            let { date } = this.$route.query
            if (!date) {
                date = moment().format('YYYY-MM-DD')
            }
            this.date = date
            this.loadData()

            this.timer = setInterval(() => {
                if (this.latestRecord) {
                    // console.log(this.latestRecord.startTime)
                    let second = (new Date().getTime() - moment(this.latestRecord.startTime).toDate().getTime()) / 1000
                    // this.timerTime = second
                    let minute = Math.floor(second / 60)
                    second = Math.ceil(second % 60)
                    this.timerTime = ('' + minute).padStart(2, '0') + ':' + ('' + second).padStart(2, '0')
                }
            }, 1000)

            document.addEventListener('keydown', this._onKeyDown = e => {
                console.log(e, e.keyCode)
                if (e.ctrlKey && e.keyCode === 78) {
                    // alert(1)
                    this.$router.push('/record/add')
                    return false
                }
            })
        },
        destroyed() {
            clearInterval(this.timer)
            document.removeEventListener('keydown', this._onKeyDown)
        },
        methods: {
            list() {
                this.$router.push('/records?date=' + this.date)
            },
            loadData() {
                let user = this.$store.state.user
                if (!user) {
                    return
                }
                this.$http.get(`/users/${user.id}/records/latest`).then(
                    response => {
                        let data = response.data
                        console.log('latest', data)
                        this.latestRecord = data
                    },
                    response => {
                        console.log('cuol')
                        if (response.code === 403) {
                            this.$store.state.user = null
                        }
                        this.loading = false
                    })
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
            to(url) {
                this.$router.push(url)
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
            quickAdd2() {
                if (!this.input) {
                    this.$message({
                        type: 'danger',
                        text: '请输入内容'
                    })
                    return
                }
                this.$http.post(`/records`, {
                    content: this.input
                }).then(
                    response => {
                        let data = response.data
                        console.log(data)
                        // this.$router.go(-1)
                        this.loadData()
                        this.input = ''
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
                        this.input = ''
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
.app-list {
    display: flex;
    .item {
        width: 25%;
        text-align: center;
        &:hover {
            opacity: .8;
        }
    }
    .link {
        display: block;
    }
    .icon {
        width: 80px;
        height: 80px;
        border-radius: 4px;
        // border: 1px solid #f1f1f1;
    }
    .name {
        color: #333;
    }
}
.search-box {
    display: flex;
    width: 100%;
    max-width: 100%;
    margin-bottom: 24px;
    // border: 1px solid #eee;
    box-shadow: 0 1px 6px rgba(0,0,0,.117647), 0 1px 4px rgba(0,0,0,.117647);
    background-color: #fff;
    &:hover {
        box-shadow: 0 3px 8px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08);
    }
    .input {
        flex-grow: 1;
        display: block;
        height: 48px;
        padding: 0 16px;
        line-height: 48px;
        border: none;
        outline: none;
    }
}
</style>
