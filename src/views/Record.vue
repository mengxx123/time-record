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
        <div class="conteiner" v-if="$store.state.user">
            <div class="section">
                <h2 class="section—title">统计</h2>
                <div>今天记录的总时间：{{ totalTime }}</div>
                <div>
                    <router-link to="/stat">更多统计信息</router-link>
                    <br>
                    <router-link :to="'/timeline?date=' + date">时间轴</router-link>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section—title">最近的记录</h2>
                <li class="item" v-if="latestRecord">
                    <router-link :to="`/records2/${latestRecord.id}`">
                        <div class="content">{{ latestRecord.content }}</div>
                    </router-link>
                    <div class="time">{{ latestRecord.startTime | time }}</div>
                    <div class="time" v-if="latestRecord.duration">{{ latestRecord.duration | duration }}</div>
                    <div @click="remove(latestRecord, index)">删除</div>
                    <div @click="finish(latestRecord, index)" v-if="!latestRecord.duration">刚刚完成</div>
                </li>
                <li class="empty" v-if="!latestRecord">没有最近记录</li>
            </div>
            <div class="section">
                <h2 class="section—title">快速添加</h2>
                <ul class="quick-list">
                    <li class="item" v-for="item, index of quickActions" :key="index" @click="quickAdd(item)">{{ item }}</li>
                </ul>
            </div>
            <h2 class="section—title">今天的记录（{{ records.length }}）</h2>
            <div @click="viewTodayBefore">查看昨天的记录</div>
            <div @click="viewToday">查看今天的记录</div>
            <div @click="viewTodayAfter">查看明天的记录</div>
            <div class="empty" v-if="!records.length">没有记录</div>
            <ul class="record-list">
                <li class="item" v-for="item, index in records" :key="index">
                    <router-link :to="`/records2/${item.id}`">
                        <div class="content">{{ item.content }}</div>
                    </router-link>
                    <div class="time">{{ item.startTime | time }}</div>
                    <div class="time" v-if="item.duration">{{ item.duration | duration }}</div>
                    <div @click="remove(item, index)">删除</div>
                    <div @click="finish(item, index)" v-if="!item.duration">刚刚完成</div>

                </li>
            </ul>
        </div>
        <ui-float-button class="float-button" icon="add" secondary @click="add" />
        
    </my-page>
</template>

<script>
    import oss from '@/util/oss'
    const moment = window.moment

    export default {
        data () {
            return {
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
                records: [],
                totalTime: '0',
                page: {
                    menu: [
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
        },
        methods: {
            loadData() {
                let user = this.$store.state.user
                if (!user) {
                    return
                }
                let { date } = this.$route.query

                this.$http.get(`/users/${user.id}/records?page_size=9999&date=${date || ''}`).then(
                    response => {
                        let data = response.data
                        console.log(data)
                        this.records = data
                        if (this.records.length) {
                            this.latestRecord = this.records[this.records.length - 1]
                        }
                        console.log('latest', this.latestRecord)
                        this.totalTime = 0
                        for (let item of this.records) {
                            // if (item.content.includes('跨天')) {
                            //     console.log('aaa', moment(item.endTime).startOf('day') > moment(this.startTime).startOf('day'))
                            // }
                            if (moment(item.startTime).startOf('day') < moment(item.endTime).startOf('day')) { // TODO
                                // 昨天跨天到今天
                                console.error('no normal')
                                let second = (moment(item.endTime).toDate().getTime() - moment(item.endTime).startOf('day').toDate().getTime()) / 1000
                                console.log(second)
                                this.totalTime += second
                            } else if (moment(item.endTime).startOf('day') > moment(item.startTime).startOf('day')) { // TODO
                                // 今天跨天到明天
                                console.error('no normal 2', item.duration)
                                let second = (moment(item.startTime).startOf('day').add(1, 'days').toDate().getTime() - moment(item.startTime).toDate().getTime()) / 1000
                                console.log(second)
                                this.totalTime += second
                            } else {
                                this.totalTime += item.duration
                            }
                        }
                        if (this.totalTime < 60) {
                            this.totalTime = this.totalTime + '秒'
                        } else if (this.totalTime < 60 * 60) {
                            this.totalTime = Math.ceil(this.totalTime / 60) + '分钟'
                        } else {
                            this.totalTime = (this.totalTime / 3600).toFixed(1) + '小时'
                        }
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
