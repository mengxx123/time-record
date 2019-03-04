<template>
    <my-page title="统计" :page="page" backable>
        <div class="conteiner">
            <h2 class="section—title">今天的记录（{{ records.length }}）</h2>
            <div class="empty" v-if="!records.length">没有记录</div>
            <ul class="record-list">
                <li class="item" v-for="item, index in records" :key="index">
                    <div class="content">{{ item.content }}</div>
                    <!-- <router-link :to="`/records2/${item.id}`">
                    </router-link> -->
                    <div class="time">{{ item.startTime | time }}</div>
                    <div class="time" v-if="item.duration">{{ item.duration | duration }}</div>
                    <!-- <div @click="remove(item, index)">删除</div> -->
                    <!-- <div @click="finish(item, index)" v-if="!item.duration">刚刚完成</div> -->

                </li>
            </ul>
        </div>
        <ui-float-button class="float-button" icon="add" secondary @click="add" />
    </my-page>
</template>

<script>
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
                ],
                latestRecord: null,
                records: [],
                totalTime: '0',
                page: {
                    menu: [
                    ]
                }
            }
        },
        mounted() {
            let { date } = this.$route.query
            if (!date) {
                date = moment().format('YYYY-MM-DD')
            }
            this.date = date
            this.loadData()
        },
        methods: {
            loadData() {
                // let id = this.$route.params.id
                let { date, content } = this.$route.query
                this.$http.get(`/users/1/records?page_size=9999&date=${date || ''}&content=${content}`).then(
                    response => {
                        let data = response.data
                        console.log(data)
                        this.records = data
                        if (this.records.length) {
                            this.latestRecord = this.records[this.records.length - 1]
                        }
                    },
                    response => {
                        console.log(response)
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
                let ret = window.confirm(`确认完成 ${item.content}？`)
                if (!ret) {
                    return
                }
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
