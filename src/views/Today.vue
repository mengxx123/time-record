<template>
    <my-page title="今天" :page="page">
        <div class="common-container">
            <a href="javascript:;" v-if="!$store.state.user" @click="login">点击登陆</a>
            <div class="container" v-if="$store.state.user">
                <!-- <div class="search-box">
                    <input class="input" v-model="keyword" placeholder="输入名称/备注搜索" @keydown="keyDown($event)">
                    <ui-icon-button icon="close" title="搜索" primary @click="clearKeyword" v-if="keyword" />
                    <ui-icon-button icon="search" title="搜索" primary @click="search" />
                </div> -->
                <h2 class="pui-section—title">最新记录</h2>
                <ui-card class="latest-box" v-if="latestDate">
                    <!-- <ui-card-title title="进行中"/> -->
                    <ui-card-text>
                        {{ latestDate.date }}
                        <!-- <router-link :to="`/records/${latestRecord.id}`">
                        <div class="content">{{ latestRecord.content }}（{{ latestRecord.value }}）</div>
                        </router-link> -->
                        <!-- <div class="timer-time" v-if="!latestRecord.duration">用时：{{ timerTime }}</div>
                        <div class="time">{{ latestRecord.startTime | time }}</div>
                        <div class="time" v-if="latestRecord.duration">{{ latestRecord.duration | duration }}</div> -->
                        <!-- <div @click="remove(latestRecord, index)">删除</div> -->
                        <!-- <ui-raised-button label="结束" @click="finish(latestRecord, index)" v-if="!latestRecord.duration" /> -->
                    </ui-card-text>
                    <!-- <ui-card-actions>
                        <ui-flat-button label="结束" @click="finish(latestRecord, index)" v-if="!latestRecord.duration"/>
                        <ui-flat-button label="编辑" @click="to(`/records/${latestRecord.id}/edit`)"/>
                        <ui-flat-button label="删除" @click="remove(latestRecord, index)"/>
                    </ui-card-actions> -->
                </ui-card>
                <div v-else>没有</div>


                <h2 class="pui-section—title">总记录（{{ objects.length }}）</h2>
                <div class="empty" v-if="!objects.length">没有物品</div>
                <ul class="record-list">
                    <li class="item" v-for="item, index in objects" :key="index">
                        <router-link class="link" :to="`/dates/${item.id}`">
                            <div class="info">
                                <div class="name">
                                    <span v-if="item.like">★</span>
                                    {{ item.date }}
                                </div>
                                <!-- <div class="note">{{ item.note }}</div> -->
                                <div class="note">
                                    {{ item.weather | weather }}
                                    {{ item.face | face }}
                                </div>
                            </div>
                            <div>
                                <div class="number">★{{ item.score / 20 }}</div>
                                <!-- <div class="price">¥{{ item.price }}</div> -->
                            </div>
                        </router-link>
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
    import oss from '@/util/oss'
    import filterUtil from '@/util/filter'
    console.log('filterUtil', filterUtil)
    const moment = window.moment

    export default {
        data () {
            return {
                keyword: '',
                objects: [],
                latestDate: null,
                page: {
                    menu: [
                        {
                            type: 'icon',
                            icon: 'list',
                            to: '/today/list',
                            title: '列表'
                        },
                        {
                            type: 'icon',
                            icon: 'bar_chart',
                            to: '/today/stat',
                            title: '统计'
                        },
                        {
                            type: 'icon',
                            icon: 'info',
                            href: 'https://project.yunser.com/products/b907f560635411e9b68b891883763223',
                            target: '_blank',
                            title: '记录列表'
                        },
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
            clearKeyword() {
                this.keyword = ''
                this.$router.push('/objects')
            },
            goToPosition() {
                this.$router.push('/positions')
            },
            viewItem(item) {
                if (item.id) {
                    this.$router.push('/dates/' + item.id)
                }
            },
            loadData() {
                let user = this.$store.state.user
                if (!user) {
                    return
                }
                let { keyword } = this.$route.query
                // this.userId = this.$route.params.id
                this.keyword = keyword
                // let { date } = this.$route.query
                this.$http.get(`/life/dates?keyword=${keyword ? encodeURIComponent(keyword) : ''}&page_size=9999`).then(
                    response => {
                        let data = response.data
                        console.log(data)
                        this.objects = data
                    },
                    response => {
                        console.log('cuol')
                        if (response.code === 403) {
                            this.$store.state.user = null
                        }
                        this.loading = false
                    })
                this.$http.get(`/life/date/latest`).then(
                    response => {
                        let data = response.data
                        console.log('latest', data)
                        this.latestDate = data
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
                this.$router.push('/date/add')
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
            },
            login() {
                location.href = oss.getOauthUrl()
            },
            search() {
                if (!this.keyword) {
                    this.$message({
                        type: 'danger',
                        text: '请输入关键词'
                    })
                    return
                }
                this.$router.push(`/objects?keyword=${encodeURIComponent(this.keyword)}`)
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
            },
            face(value) {
                let map = {
                    0: '',
                    1: '超烂',
                    2: '不爽',
                    3: '还行',
                    4: '开心',
                    5: '狂喜',
                }
                return map[value]
            },
            weather: filterUtil.weather
        }
    }
</script>

<style lang="scss" scoped>
.latest-box {
    margin-bottom: 16px;
}
.simple-login-box {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .12);
}
.container {
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
    margin-bottom: 16px;
    .item {
        // display: flex;
        // justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid rgba(0, 0, 0, .12);
    }
    .link {
        display: flex;
        justify-content: space-between;
        color: inherit;
    }
    .name {
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
    }
    .times {
        color: #666;
        cursor: pointer;
    }
    .note {
        color: #999;
    }
    .number {
        text-align: right;
    }
    .price {
        color: #f00;
        text-align: right;
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
