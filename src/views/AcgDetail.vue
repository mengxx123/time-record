<template>
    <my-page title="书籍/视频详情" :page="page" backable>
        <div class="common-container">
            <ui-article v-if="myObject">
                <h2>名称：{{ myObject.objectName }}</h2>
                <p>备注：{{ myObject.note || '无' }}</p>
                <p>状态：{{ myObject.state || '无' }}</p>
                <p>类型：{{ myObject.type || '无' }}</p>
                <p v-if="myObject.url">链接：<a :href="myObject.url" target="_blank">{{ myObject.url }}</a></p>
                <p v-else>链接：无</p>
                <p v-if="myObject.score">评分：{{ myObject.score / 20 }}</p>
                <p v-if="!myObject.score">评分：未评分</p>
                <p>
                    <button @click="setScore(20)">1星</button>
                    <button @click="setScore(40)">2星</button>
                    <button @click="setScore(60)">3星</button>
                    <button @click="setScore(80)">4星</button>
                    <button @click="setScore(100)">5星</button>
                </p>
                <!-- <p>数量：{{ myObject.number }}</p> -->
                <!-- <p>价格：¥{{ myObject.price }}</p> -->
                <!-- <p>购买时间：{{ myObject.buyTime }}</p> -->
                <!-- <p>记录时间：{{ myObject.createTime }}</p> -->
                <!-- <p v-if="myObject.duration">持续时间：{{ myObject.duration }} 秒</p> -->
                <!-- <p v-if="myObject.duration">结束时间：{{ myObject.endTime }}</p> -->
                <a :href="`https://www.baidu.com/s?ie=UTF-8&wd=${encodeURIComponent(myObject.objectName)}`" target="_blank">百度</a>
                <p>
                    <button @click="setType('anim')">动画</button>
                    <button @click="setType('comic')">漫画</button>
                    <button @click="setType('game')">游戏</button>
                    <button @click="setType('book')">书籍</button>
                    <button @click="setType('movie')">电影</button>
                </p>
                <p>
                    <button @click="setState('readed')">看过</button>
                    <button @click="setState('like')">想看</button>
                    <button @click="setState('reading')">在看</button>
                    <button @click="readFinish()">看完</button>
                    <button @click="setState('unlike')">忽略</button>
                </p>
            </ui-article>
            <!-- <div class="btns">
                <ui-raised-button class="btn" primary label="添加记录" @click="addRecord" />
                <ui-raised-button class="btn" label="生成二维码" @click="createQrcode" />
            </div> -->
        </div>
    </my-page>
</template>

<script>
    /* eslint-disable */
    const moment = window.moment

    export default {
        data () {
            return {
                myObject: null,
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
            console.log('mounted')
            this.ObjectId = this.$route.params.id
            this.loadData()
        },
        methods: {
            loadData() {
                this.$http.get(`/read/logs/${this.ObjectId}`).then(
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
            },
            createQrcode() {
                let url = `https://record.yunser.com/objects/${this.ObjectId}/qrcode`
                url = `https://nodeapi.yunser.com/qrcode?content=${encodeURIComponent(url)}`
                this.qrcodeUrl = url
            },
            edit() {
                this.$router.push(`/acgs/${this.$route.params.id}/edit`)
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
            setScore(score) {
                this.$http.put(`/read/logs/${this.myObject.id}`, {
                    objectName: this.myObject.objectName.replace(':', '：'),
                    score,
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
            setType(type) {
                this.$http.put(`/read/logs/${this.myObject.id}`, {
                    // objectName: this.myObject.objectName.replace(':', '：'),
                    type,
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
            readFinish() {
                this.update({
                    state: 'readed',
                    progress: 1
                })
            },
            setState(state) {
                this.update({
                    state,
                })
            },
            update(params) {
                this.$http.put(`/read/logs/${this.myObject.id}`, params).then(
                    response => {
                        let data = response.data
                        this.loadData()
                    },
                    response => {
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
                let ret = window.confirm(`确认删除 ${this.myObject.objectName}？`)
                if (!ret) {
                    return
                }
                this.$http.delete(`/read/logs/${this.myObject.id}`).then(
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
