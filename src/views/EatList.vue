<template>
    <my-page title="所有饮食" :page="page" backable>
        <div class="common-container">
            <a href="javascript:;" v-if="!$store.state.user" @click="login">点击登陆</a>
            <div class="container" v-if="$store.state.user">
                <!-- <div class="search-box">
                    <input class="input" v-model="keyword" placeholder="输入名称/备注搜索" @keydown="keyDown($event)">
                    <ui-icon-button icon="add" title="添加" primary @click="quickAdd" />
                    <ui-icon-button icon="close" title="搜索" primary @click="clearKeyword" v-if="keyword" />
                    <ui-icon-button icon="search" title="搜索" primary @click="search" />
                </div> -->
                <h2 class="section—title">总记录（{{ objects.length }}）</h2>
                <div class="empty" v-if="!objects.length">没有物品</div>
                <ul class="record-list">
                    <li class="item" v-for="item, index in objects" :key="index">
                        <router-link class="link" :to="`/objects/${item.id}`">
                            <div class="info">
                                <div class="name">{{ item.content }}</div>
                                <div class="note">{{ item.dayAgo }} 天前</div>
                            </div>
                            <!-- <div>
                                <div class="number">×{{ item.number }}</div>
                                <div class="price">¥{{ item.price }}</div>
                            </div> -->
                        </router-link>
                        <!-- <div class="time">{{ item.startTime | time }}</div> -->
                        <!-- <div class="time" v-if="item.duration">{{ item.duration | duration }}</div> -->
                        <div @click="remove(item, index)">删除</div>
                        <!-- <div @click="finish(item, index)" v-if="!item.duration">刚刚完成</div> -->

                    </li>
                </ul>
            </div>
        </div>
        <!-- <ui-float-button class="float-button" icon="add" secondary @click="add" /> -->
        
    </my-page>
</template>

<script>
    import oss from '@/util/oss'
    const moment = window.moment

    export default {
        data () {
            return {
                keyword: '',
                objects: [],
                page: {
                    menu: [
                        {
                            type: 'icon',
                            icon: 'list',
                            click: this.goToPosition,
                            title: '记录列表'
                        },
                        {
                            type: 'icon',
                            icon: 'info',
                            href: 'https://project.yunser.com/products/60b7a8a05dba11e99da1c5fddb71d576',
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
            loadData() {
                let user = this.$store.state.user
                if (!user) {
                    return
                }
                let { keyword } = this.$route.query
                // this.userId = this.$route.params.id
                this.keyword = keyword
                // let { date } = this.$route.query
                this.$http.get(`/eat/logs?keyword=${keyword ? encodeURIComponent(keyword) : ''}&page_size=9999`).then(
                    response => {
                        let data = response.data
                        console.log(data)
                        this.objects = data.map(item => {
                            let weeks = '日一二三四五六'.split('')
                            const DAY = 24 * 3600 * 1000
                            return {
                                ...item,
                                week: weeks[moment(item.recordTime).day()],
                                dayAgo: Math.floor((moment().startOf('day').toDate().getTime() - moment(item.recordTime).startOf('day').toDate().getTime()) / DAY)
                            }
                        })
                        if (this.records.length) {
                            this.latestRecord = this.records[this.records.length - 1]
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
                this.$router.push('/object/add')
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
                this.$http.delete(`/eat/logs/${item.id}`).then(
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
            quickAdd() {
                this.$http.post(`/eat/logs`, {
                    content: this.keyword
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
