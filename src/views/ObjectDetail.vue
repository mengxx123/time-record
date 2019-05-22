<template>
    <my-page title="物品详情" :page="page" backable>
        <div class="common-container" v-if="myObject">
            <ui-article>
                <h2>名称：{{ myObject.name }}</h2>
                <p>备注：{{ myObject.note || '无' }}</p>
                <p>数量：{{ myObject.number }}</p>
                <p>价格：¥{{ myObject.price }}</p>
                <p>标星：{{ myObject.like ? '是' : '否' }}
                    <a href="#" @click.prevent="toggleLike">{{ myObject.like ? '取消' : '标星' }}</a>
                </p>
                <p>位置：
                    <router-link :to="`/positions/${myObject.position.id}`" v-if="myObject.position.id">{{ myObject.position.name }}</router-link>
                    <!-- <router-link :to="`/positions/${myObject.position.id}`" v-if="myObject.position.id !== '0'">{{ myObject.position.name }}</router-link> -->
                    <span v-else>无</span>
                    <!-- {{ myObject.position ? myObject.position.name : '无' }}</p> -->
                <p>购买时间：{{ myObject.buyTime }}</p>
                <!-- <p>记录时间：{{ myObject.createTime }}</p> -->
                <!-- <p v-if="myObject.duration">持续时间：{{ myObject.duration }} 秒</p> -->
                <!-- <p v-if="myObject.duration">结束时间：{{ myObject.endTime }}</p> -->
            </ui-article>
            <div class="btns">
                <ui-raised-button class="btn" primary label="添加记录" @click="addRecord" />
                <ui-raised-button class="btn" label="-1" @click="subtractOne" />
                <ui-raised-button class="btn" label="生成二维码" @click="createQrcode" />
            </div>
            <img class="qrcode" :src="qrcodeUrl">
            <div class="section">
                <!-- <h2 class="section—title">相关记录</h2> -->
                <h2 class="section—title">相关记录（{{ records.length }}）</h2>
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
                        <!-- <div @click="remove(item, index)">删除</div> -->
                        <!-- <div @click="finish(item, index)" v-if="!item.duration">刚刚完成</div> -->
                    </li>
                </ul>
                <!-- <div class="search-box">
                    <input class="input" v-model="input" placeholder="输入内容" @keydown="keyDown($event)">
                    <ui-icon-button icon="add" title="搜索" primary @click="quickAdd2" />
                </div>
                <ul class="quick-list">
                    <li class="item" v-for="item, index of quickActions" :key="index" @click="quickAdd(item)">{{ item }}</li>
                </ul> -->
            </div>
        </div>
    </my-page>
</template>

<script>
    /* eslint-disable */
    const moment = window.moment

    export default {
        data () {
            return {
                myObject: {
                    content: '',
                    note: '',
                },
                qrcodeUrl: '',
                minute: null,
                endTime: '',
                records: [],
                page: {
                    menu: [
                        {
                            type: 'icon',
                            icon: 'edit',
                            click: this.edit,
                            title: '编辑'
                        },
                        {
                            type: 'icon',
                            icon: 'delete',
                            click: this.remove,
                            title: '删除'
                        },
                    ]
                }
            }
        },
        mounted() {
            this.ObjectId = this.$route.params.id
            this.loadData()
        },
        methods: {
            loadData() {
                this.$http.get(`/life/objects/${this.ObjectId}`).then(
                    response => {
                        let data = response.data
                        console.log(data)
                        this.myObject = data
                        this.myObject.buyTime = moment(this.myObject.buyTime).format('YYYY-MM-DD HH:mm:ss')
                        // this.myObject.endTime = moment(this.myObject.endTime).format('YYYY-MM-DD HH:mm:ss')
                        // this.endTime = this.myObject.endTime

                        // this.$router.go(-1)
                    },
                    response => {
                        console.log(response)
                        this.loading = false
                    })
                this.$http.get(`/records?objectId=${this.ObjectId}`).then(
                    response => {
                        let data = response.data
                        console.log('记录', data)
                        // this.records = data
                        this.records = data.map(item => {
                            let weeks = '日一二三四五六'.split('')
                            const DAY = 24 * 3600 * 1000
                            return {
                                ...item,
                                week: weeks[moment(item.startTime).day()],
                                dayAgo: Math.floor((moment().startOf('day').toDate().getTime() - moment(item.startTime).startOf('day').toDate().getTime()) / DAY)
                            }
                        })
                        // this.myObject = data
                        // this.myObject.buyTime = moment(this.myObject.buyTime).format('YYYY-MM-DD HH:mm:ss')
                        // this.myObject.endTime = moment(this.myObject.endTime).format('YYYY-MM-DD HH:mm:ss')
                        // this.endTime = this.myObject.endTime

                        // this.$router.go(-1)
                    },
                    response => {
                        console.log(response)
                        this.loading = false
                    })
            },
            subtractOne() {
                this.$http.post(`/records`, {
                    objectId:this.myObject.id,
                    content: `使用了一个${this.myObject.name}，剩余：${this.myObject.number - 1}`
                    // number: this.myObject.number - 1
                }).then(
                    response => {
                        let data = response.data
                        console.log(data)
                        this.$http.put(`/life/objects/${this.ObjectId}`, {
                            number: this.myObject.number - 1
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
                        // this.loadData()
                    },
                    response => {
                        console.log(response)
                        this.loading = false
                    })
            },
            toggleLike() {
                this.$http.put(`/life/objects/${this.ObjectId}`, {
                    like: !this.myObject.like,
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
            createQrcode() {
                let url = `https://record.yunser.com/objects/${this.ObjectId}/qrcode`
                url = `https://nodeapi.yunser.com/qrcode?content=${encodeURIComponent(url)}`
                this.qrcodeUrl = url
            },
            edit() {
                this.$router.push(`/objects/${this.$route.params.id}/edit`)
            },
            finish() {
                if (!this.record.content) {
                    this.$message({
                        type: 'danger',
                        text: '请输入内容'
                    })
                    return
                }
                this.$http.put(`/records/${this.record.id}`, {
                    ...this.record
                    // content: this.content
                }).then(
                    response => {
                        let data = response.data
                        console.log(data)
                        this.$router.go(-1)
                    },
                    response => {
                        console.log(response)
                        this.loading = false
                    })
            },
            endNow() {
                this.record.endTime = moment().format('YYYY-MM-DD HH:mm:ss')
                this.record.duration = (moment(this.record.endTime).toDate().getTime() - moment(this.record.startTime).toDate().getTime()) / 1000
            },
            quickSetting() {
                if (!this.minute) {
                    this.$message({
                        type: 'danger',
                        text: '请输入分钟'
                    })
                    return
                }
                this.record.duration = this.minute * 60
                this.record.endTime = moment(this.record.startTime).add(this.record.duration, 's').format('YYYY-MM-DD HH:mm:ss')
            },
            quickSetting2() {
                if (!this.endTime) {
                    this.$message({
                        type: 'danger',
                        text: '请输入结束时间'
                    })
                    return
                }
                this.record.endTime = this.endTime
                this.record.duration = (moment(this.record.endTime).toDate().getTime() - moment(this.record.startTime).toDate().getTime()) / 1000
                // this.record.endTime = moment(this.record.startTime).add(this.record.duration, 's').format('YYYY-MM-DD HH:mm:ss')
            },
            remove() {
                let ret = window.confirm(`确认删除 ${this.myObject.name}？`)
                if (!ret) {
                    return
                }
                this.$http.delete(`/life/objects/${this.myObject.id}`).then(
                    response => {
                        // let data = response.data
                        this.$router.go(-1)
                    },
                    response => {
                        console.log(response)
                        this.loading = false
                    })
            },
            stat() {
                this.$router.push(`/record/stat?content=${this.record.content}`)
            },
            prev() {
                this.$http.get(`/records/${this.record.id}/prev`).then(
                    response => {
                        let data = response.data
                        console.log('上一个', data)
                        if (!data) {
                            this.$message({
                                type: 'danger',
                                text: '没有上一个记录'
                            })
                            return
                        }
                        // // this.$router.go(-1)
                        // this.record.startTime = moment(data.endTime).format('YYYY-MM-DD HH:mm:ss')
                        // this.record.duration = (moment(this.record.endTime).toDate().getTime() - moment(this.record.startTime).toDate().getTime()) / 1000
                        this.$router.replace(`/records/${data.id}`)
                    },
                    response => {
                        console.log(response)
                        this.loading = false
                    })
            },
            next() {
                this.$http.get(`/records/${this.record.id}/next`).then(
                    response => {
                        let data = response.data
                        console.log('下一个', data)
                        if (!data) {
                            this.$message({
                                type: 'danger',
                                text: '没有下一个记录'
                            })
                            return
                        }
                        this.$router.replace(`/records/${data.id}`)
                    },
                    response => {
                        console.log(response)
                        this.loading = false
                    })
            },
            addRecord() {
                this.$router.push(`/record/add?objectId=${this.ObjectId}`)
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
.container {
    max-width: 400px;
    margin: 0 auto;
}

.float-button {
    position: fixed;
    right: 24px;
    bottom: 24px;
}
.btns {
    margin-bottom: 16px;
}
.qrcode {
    border: 1px solid #eee;
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
.btns {
    .btn {
        margin-right: 8px;
    }
}
</style>
