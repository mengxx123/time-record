
<template>
    <my-page :title="title" backable>
        <ui-text-field class="input" v-model="myObject.name" label="名称" />

        <br>
        <ui-text-field class="input" v-model="myObject.note" label="备注" />

        <br>
        <ui-raised-button primary label="保存" @click="finish" />
    </my-page>
</template>

<script>
    const moment = window.moment

    export default {
        data () {
            return {
                positions: [],
                editType: 'create',
                title: '',
                myObject: {
                    content: '',
                    note: '',
                    buyTime: '',
                    positionId: ''
                },
                minute: null,
                endTime: '',
                page: {
                    menu: [
                        {
                            type: 'icon',
                            icon: 'help',
                            to: '/help'
                        }
                    ]
                }
            }
        },
        mounted() {
            let id = this.$route.params.id

            this.$http.get(`/life/positions?page_size=9999`).then(
                response => {
                    let data = response.data
                    console.log(data)
                    this.positions = data
                    if (id) {
                        this.editType = 'update'
                        this.title = '修改位置'
                        this.$http.get(`/life/positions/${id}`).then(
                            response => {
                                let data = response.data
                                console.log(data)
                                this.myObject = data
                                this.myObject.buyTime = moment(this.myObject.buyTime).format('YYYY-MM-DD HH:mm:ss')
                            },
                            response => {
                                console.log(response)
                                this.loading = false
                            })
                    } else {
                        this.title = '添加位置'
                    }
                },
                response => {
                    console.log('cuol')
                    if (response.code === 403) {
                        this.$store.state.user = null
                    }
                    this.loading = false
                })
            document.addEventListener('keydown', this._onKeyDown = e => {
                console.log(e, e.keyCode)
                if (e.ctrlKey && e.keyCode === 83) {
                    this.finish()
                    return false
                }
            })
        },
        destroyed() {
            clearInterval(this.timer)
            document.removeEventListener('keydown', this._onKeyDown)
        },
        methods: {
            finish() {
                if (!this.myObject.name) {
                    this.$message({
                        type: 'danger',
                        text: '请输入名称'
                    })
                    return
                }
                if (this.editType === 'update') {
                    this.$http.put(`/life/positions/${this.myObject.id}`, {
                        ...this.myObject
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
                } else {
                    this.$http.post(`/life/positions`, {
                        ...this.myObject
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
                }
            },
            endNow() {
                this.record.endTime = moment().format('YYYY-MM-DD HH:mm:ss')
                this.record.duration = (moment(this.record.endTime).toDate().getTime() - moment(this.record.startTime).toDate().getTime()) / 1000
            },
            quickSetting() {
                if (!this.minute && this.minute !== 0) {
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
            stat() {
                this.$router.push(`/record/stat?content=${this.record.content}`)
            },
            prev() {
                this.$http.get(`/records/${this.record.id}/prev`).then(
                    response => {
                        let data = response.data
                        console.log('上一个', data)
                        if (!data) {
                            if (!this.endTime) {
                                this.$message({
                                    type: 'danger',
                                    text: '没有上一个记录'
                                })
                                return
                            }
                            return
                        }
                        // this.$router.go(-1)
                        this.record.startTime = moment(data.endTime).format('YYYY-MM-DD HH:mm:ss')
                        this.record.duration = (moment(this.record.endTime).toDate().getTime() - moment(this.record.startTime).toDate().getTime()) / 1000
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
                        console.log('上一个', data)
                        if (!data) {
                            if (!this.endTime) {
                                this.$message({
                                    type: 'danger',
                                    text: '没有下一个记录'
                                })
                                return
                            }
                            return
                        }
                        // this.$router.go(-1)
                        this.record.endTime = moment(data.startTime).format('YYYY-MM-DD HH:mm:ss')
                        this.record.duration = (moment(this.record.endTime).toDate().getTime() - moment(this.record.startTime).toDate().getTime()) / 1000
                    },
                    response => {
                        console.log(response)
                        this.loading = false
                    })
            }
        }
    }
</script>

<style lang="scss" scoped>
.record-list {
    .item {
        display: flex;
        justify-content: space-between;
        max-width: 400px;
        margin: 0 auto;
        padding: 16px 0;
        border-bottom: 1px solid rgba(0, 0, 0, .12);
    }
    .title {
        font-size: 16px;
        font-weight: bold;
    }
    .times {
        color: #666;
    }
}
.float-button {
    position: fixed;
    right: 24px;
    bottom: 24px;
}
</style>
