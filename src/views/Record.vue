<template>
    <my-page title="记录列表" :page="page" backable>
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
            <div class="btns">
                <ui-raised-button class="btn" secondary label="前一天" @click="prev" />
                <ui-raised-button class="btn" primary label="后一天" @click="next" />
            </div>
            <div>
                <router-link :to="'/timeline?date=' + date">时间轴</router-link>
            </div>

            <div class="section">
                <h2 class="section—title">{{ date }} 的统计</h2>
                <div>总时间：{{ totalTime }}</div>
                <div>总积分：{{ totalScore }}</div>
            </div>

            <h2 class="section—title">{{ date }} 的记录（{{ records.length }}）</h2>
            <!-- <div @click="viewTodayBefore">查看昨天的记录</div>
            <div @click="viewToday">查看今天的记录</div>
            <div @click="viewTodayAfter">查看明天的记录</div> -->
            <div class="empty" v-if="!records.length">没有记录</div>
            <ul class="record-list">
                <li class="item" v-for="item, index in records" :key="index">
                    <router-link :to="`/records/${item.id}`">
                        <div class="content">{{ item.content }}（记录值{{ item.value }}，积分：{{ item.score }}）</div>
                    </router-link>
                    <div class="time">{{ item.startTime | time }}</div>
                    <div class="time" v-if="item.duration">{{ item.duration | duration }}</div>
                    <div @click="remove(item, index)">删除</div>
                    <a href="#" @click.prevent="finish(item, index)" v-if="!item.duration">结束</a>

                </li>
            </ul>
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
                date: '',
                records: [],
                totalTime: '0',
                totalScore: 0,
                timerTime: '-',
                page: {
                    menu: [
                        // {
                        //     type: 'icon',
                        //     icon: 'search',
                        //     to: '/search',
                        //     title: '搜索'
                        // }
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
                        this.totalTime = 0
                        this.totalScore = 0
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
                            this.totalScore += item.score
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
            },
            prev() {
                console.log('prev')
                let date = moment(this.date).subtract(1, 'days').format('YYYY-MM-DD')
                this.$router.replace(`/records?date=${date}`)
            },
            next() {
                let date = moment(this.date).add(1, 'days').format('YYYY-MM-DD')
                this.$router.replace(`/records?date=${date}`)
            },
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
.btns {
    margin-bottom: 16px;
    margin-right: 8px;
}
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
