<template>
    <my-page title="时间轴" :page="page" backable>
        <div class="common-container">
            <h2></h2>
            <div class="percent" v-if="statVisible">
                {{ isToday ? '今天' : date }}已经过了 {{ totalTime }} 个小时，记录了 {{ recordTime }} 个小时，占比 {{ percent }}%
            </div>
            <div class="btns">
                <ui-raised-button class="btn" secondary label="前一天" @click="prev" />
                <ui-raised-button class="btn" primary label="后一天" @click="next" />
            </div>
            <div class="timeline">
                <div class="timeline-list">
                    <div class="item" v-for="item in times">
                        <div class="time">{{ item }}</div>
                        <div class="content"></div>
                    </div>
                </div>
                <ul class="record-list">
                    <li class="item" v-for="item, index in records" :key="index" :style="{top: item.top + 'px', height: item.height + 'px'}">
                        <div class="bg" :title="item.title"></div>
                        <div class="content" :title="item.title">
                            <router-link :to="`/records/${item.id}`">
                                {{ item.content }}
                            </router-link>
                        </div>
                        <!-- <div class="time">{{ item.startTime | time }}</div>
                        <div class="time" v-if="item.duration">{{ item.duration | duration }}</div>
                        <div @click="remove(item, index)">删除</div>
                        <div @click="finish(item, index)" v-if="!item.duration">刚刚完成</div> -->

                    </li>
                </ul>
            </div>
        </div>
        <ui-float-button class="float-button" icon="add" secondary @click="add" />
    </my-page>
</template>

<script>
    const moment = window.moment

    function subtractSecond(m1, m2) {
        return (moment(m1).toDate().getTime() - moment(m2).toDate().getTime()) / 1000
    }

    export default {
        data () {
            return {
                statVisible: true,
                isToday: true,
                totalTime: 0,
                recordTime: 0,
                percent: 0,
                times: [],
                records: [],
                page: {
                    menu: [
                    ]
                }
            }
        },
        mounted() {
            console.log(this.$router)
            this.initTimeline()
            this.loadData()
        },
        methods: {
            initTimeline() {
                for (let hour = 0; hour < 24; hour++) {
                    for (let minute = 0; minute < 60; minute += 5) {
                        // console.log('time' + minute)
                        this.times.push((hour + '').padStart(2, '0') + ':' + ('' + minute).padStart(2, '0'))
                    }
                }
            },
            loadData() {
                let { date } = this.$route.query
                if (!date) {
                    date = moment().format('YYYY-MM-DD')
                }
                this.date = date
                this.statVisible = moment(this.date).startOf('day') <= moment().startOf('day')
                this.isToday = this.date === moment().format('YYYY-MM-DD')
                // let id = this.$route.params.id
                // let { date } = this.$route.query

                this.$http.get(`/users/1/records?page_size=9999&date=${date}`).then(
                    response => {
                        let data = response.data
                        console.log(data)
                        // this.date = moment().format('YYYY-MM-DD')
                        this.records = data.map(item => {
                            // console.log('item', item)
                            let date = moment(item.startTime).toDate()
                            let second = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()
                            let top = second / 60 / 5 * 32
                            let height = item.duration / 60 / 5 * 32
                            if (height < 20) {
                                height = 20
                            }
                            let title = `${item.content}
${moment(item.startTime).format('YYYY-MM-DD HH:mm:ss')}`
                            if (moment(item.startTime).startOf('day') < moment(item.endTime).startOf('day') && moment(item.startTime) < moment(this.date, 'YYYY-MM-DD').startOf('day')) {
                                console.error('before')
                                top = -20
                                height = subtractSecond(moment(item.endTime), moment(this.date, 'YYYY-MM-DD').startOf('day')) / 60 / 5 * 32
                            }
                            if (moment(item.startTime).startOf('day') < moment(item.endTime).startOf('day') && moment(item.endTime) > moment(this.date, 'YYYY-MM-DD').endOf('day')) {
                                console.error('after')
                                // top = -20
                                height = subtractSecond(moment(this.date, 'YYYY-MM-DD').endOf('day'), moment(item.startTime)) / 60 / 5 * 32 + 20
                            }
                            return {
                                ...item,
                                top,
                                height,
                                title,
                            }
                        })
                        // if (this.records.length) {
                        //     this.latestRecord = this.records[this.records.length - 1]
                        // }
                        // console.log('latest', this.latestRecord)
                        this.recordTime = 0
                        for (let item of this.records) {
                            this.recordTime += item.duration
                        }
                        let date = new Date()
                        let second = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()
                        second = this.isToday ? second : (24 * 3600)
                        this.totalTime = (second / 3600).toFixed(1)
                        this.percent = (this.recordTime / second * 100).toFixed(1)
                        this.recordTime = (this.recordTime / 3600).toFixed(1)
                        // if (this.totalTime < 60) {
                        //     this.totalTime = this.totalTime + '秒'
                        // } else if (this.totalTime < 60 * 60) {
                        //     this.totalTime = Math.ceil(this.totalTime / 60) + '分钟'
                        // } else {
                        //     this.totalTime = (this.totalTime / 3600).toFixed(1) + '小时'
                        // }
                    },
                    response => {
                        console.log(response)
                        this.loading = false
                    })
            },
            prev() {
                let date = moment(this.date).subtract(1, 'days').format('YYYY-MM-DD')
                this.$router.replace(`/timeline?date=${date}`)
            },
            next() {
                let date = moment(this.date).add(1, 'days').format('YYYY-MM-DD')
                this.$router.replace(`/timeline?date=${date}`)
            },
            add() {
                this.$router.push('/record/add')
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
.percent {
    margin-bottom: 24px;
}
.timeline {
    position: relative;
    // border: 1px solid #f00;
}
.conteiner {
    max-width: 100%;
    width: 400px;
    margin: 0 auto;
}
.timeline-list {
    .item {
        height: 32px;
        border: 1px solid #000;
    }
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
        position: absolute;
        left: 40px;
        right: 0;
        // width: 100%;
        // width: 40px;
        // display: flex;
        // justify-content: space-between;
        // padding: 16px 0;
        // border: 1px solid #000;
        // background-color: #fff;
    }
    // .title {
    //     font-size: 16px;
    //     font-weight: bold;
    //     cursor: pointer;
    // }
    .content {
        position: absolute;
        left: 0;
        top: 0;
        padding: 2px 4px;
        color: #666;
        border: 1px solid #999;
        background-color: #fff;
        border-radius: 4px;
    }
    .bg {
        position: absolute;
        left: 0;
        top: 0;
        width: 40px;
        height: 100%;
        border: 1px solid #999;
        background-color: #fff;
        border-radius: 8px;
    }
    // .times {
    //     color: #666;
    //     cursor: pointer;
    // }
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
