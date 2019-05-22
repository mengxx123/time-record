<template>
    <my-page title="今日详情" :page="page" backable>
        <div class="common-container" v-if="myObject">
            <ui-article>
                <h2>日期：{{ myObject.date }}</h2>
                <h2>天气：{{ myObject.weather | weather }}</h2>
                <h2>心情：{{ myObject.face | face }}</h2>
                <p>备注：{{ myObject.note || '无' }}</p>
                <p>评分：{{ myObject.score ? (myObject.score / 20) : null }}</p>
                <p>
                    <button @click="setFace('5')">狂喜</button>
                    <button @click="setFace('4')">开心</button>
                    <button @click="setFace('3')">还行</button>
                    <button @click="setFace('2')">不爽</button>
                    <button @click="setFace('1')">超烂</button>
                </p>
                <p>
                    <button @click="setWeather('sunny')">晴</button>
                    <button @click="setWeather('rainy')">雨</button>
                    <button @click="setWeather('cloudy')">多云</button>
                </p>
            </ui-article>
        </div>
    </my-page>
</template>

<script>
    /* eslint-disable */
    import filterUtil from '@/util/filter'
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
                this.$http.get(`/life/dates/${this.ObjectId}`).then(
                    response => {
                        let data = response.data
                        console.log(data)
                        this.myObject = data
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
            setFace(face) {
                this.update({
                    face,
                })
            },
            setWeather(weather) {
                this.update({
                    weather,
                })
            },
            update(params) {
                this.$http.put(`/life/dates/${this.myObject.id}`, params).then(
                    response => {
                        let data = response.data
                        this.loadData()
                    },
                    response => {
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
                this.$router.push(`/dates/${this.$route.params.id}/edit`)
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
                let ret = window.confirm(`确认删除 ${this.myObject.date}？`)
                if (!ret) {
                    return
                }
                this.$http.delete(`/life/dates/${this.myObject.id}`).then(
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
