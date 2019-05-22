<template>
    <my-page title="统计" :page="page" backable>
        <div class="common-container">
            <a href="javascript:;" v-if="!$store.state.user" @click="login">点击登陆</a>
            <div class="container" v-if="$store.state.user">

                <h2 class="pui-section—title">年度评分表</h2>
                <div class="pixel">
                    <div class="col">
                        <div class="grid"></div>
                        <div class="grid" v-for="n in 31">{{ n }}</div>
                    </div>
                    <div class="col month" v-for="month, index in pixel">
                        <div class="grid">{{ index + 1 }}</div>
                        <div class="grid" v-for="item in month">
                            <div :class="['dot', 'score-' + item.score, item.id ? 'clickable' : '']" @click="viewItem(item)">
                                <!-- {{ item.face }} -->
                            </div>
                        </div>
                    </div>
                </div>

                <h2 class="pui-section—title">年度心情表</h2>
                <div class="pixel">
                    <div class="col">
                        <div class="grid"></div>
                        <div class="grid" v-for="n in 31">{{ n }}</div>
                    </div>
                    <div class="col month" v-for="month, index in pixel">
                        <div class="grid">{{ index + 1 }}</div>
                        <div class="grid" v-for="item in month">
                            <div :class="['dot', 'face-' + item.face, item.id ? 'clickable' : '']" @click="viewItem(item)">
                                <!-- {{ item.face }} -->
                            </div>
                        </div>
                    </div>
                </div>

                <h2 class="pui-section—title">年度天气表</h2>
                <div class="pixel">
                    <div class="col">
                        <div class="grid"></div>
                        <div class="grid" v-for="n in 31">{{ n }}</div>
                    </div>
                    <div class="col month" v-for="month, index in pixel">
                        <div class="grid">{{ index + 1 }}</div>
                        <div class="grid" v-for="item in month">
                            <div :class="['dot', 'weather-' + item.weather, item.id ? 'clickable' : '']" @click="viewItem(item)">
                                <!-- {{ item.face }} -->
                            </div>
                        </div>
                    </div>
                </div>

                <h2 class="pui-section—title">总记录（{{ objects.length }}）</h2>
                <ul class="record-list">
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
                pixel: [],
                latestDate: null,
                page: {
                    menu: [
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

            let m = moment().startOf('year')
            console.error(m.format('YYYY'))
            while (m.format('YYYY') === '2019') {
                // console.log(m.format('YYYY-MM-DD'))
                let month = m.month()
                if (!this.pixel[month]) {
                    this.pixel[month] = []
                }
                this.pixel[month].push({
                    date: m.format('YYYY-MM-DD')
                })
                m.add(1, 'days')
            }
            console.log('this.pixel', this.pixel)

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
                        for (let item of this.objects) {
                            let m = moment(item.date, 'YYYY-MM-DD')
                            console.log(m.month(), m.date())
                            this.pixel[m.month()][m.date() - 1].face = item.face
                            this.pixel[m.month()][m.date() - 1].weather = item.weather
                            this.pixel[m.month()][m.date() - 1].score = item.score
                            this.pixel[m.month()][m.date() - 1].id = item.id
                        }
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
.pixel {
    margin-bottom: 80px;
    display: flex;
    .col {
        width: 24px;
    }
    .month {
    }
    .grid {
        height: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        // text-align: center;
        // line-height: 24px;
        // border: 1px solid #000;
    }
    .dot {
        width: 16px;
        height: 16px;
        background-color: #eee;
        border-radius: 50%;
    }
    .clickable {
        cursor: pointer;
    }

    .face-1 {
        background-color: #EA4335;
    }
    .face-2 {
        background-color: rgb(236, 153, 29);
    }
    .face-3 {
        background-color: #4285f4;
    }
    .face-4 {
        background-color: rgb(32, 207, 16);
    }
    .face-5 {
        background-color: #34A853;
    }

    .weather-rainy {
        background-color: #4285f4;
    }
    .weather-sunny {
        background-color: #EA4335;
    }
    .weather-cloudy {
        background-color: #666;
    }

    .score-20 {
        background-color: #EA4335;
    }
    .score-40 {
        background-color: rgb(236, 153, 29);
    }
    .score-60 {
        background-color: #4285f4;
    }
    .score-80 {
        background-color: rgb(32, 207, 16);
    }
    .score-100 {
        background-color: #34A853;
    }
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
