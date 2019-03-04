<template>
    <my-page title="修改记录" backable>
        <ui-text-field class="input" v-model="record.content" label="内容" />
        <br>
        <ui-text-field class="input" v-model="record.note" label="备注" />
        <br>
        <ui-text-field class="input" v-model="record.startTime" label="开始时间" />
        <br>
        <ui-text-field class="input" v-model="record.duration" label="持续时间（秒）" disabled />
        <br>
        <ui-text-field class="input" v-model="record.endTime" label="结束时间（分组）" disabled />
        <br>
        <ui-raised-button primary label="保存" @click="finish" />

        <hr>
        <ui-raised-button primary label="设置结束时间为当前时间" @click="endNow" />

        <hr>
        <ui-raised-button primary label="设置开始时间为上一个记录的结束时间" @click="prev" />

        <hr>
        <ui-raised-button primary label="设置结束时间为下一个记录的开始时间" @click="next" />

        <hr>
        <ui-raised-button primary label="查看同事件统计" @click="stat" />

        <hr>
        <ui-raised-button primary label="删除" @click="remove" />

        <hr>
        <ui-text-field class="input" v-model.number="minute" label="持续时间（分钟）" />
        <br>
        <ui-raised-button primary label="快速设置" @click="quickSetting" />

        <hr>
        <ui-text-field class="input" v-model="endTime" label="结束时间" />
        <br>
        <ui-raised-button primary label="快速设置" @click="quickSetting2" />
    </my-page>
</template>

<script>
    const moment = window.moment

    export default {
        data () {
            return {
                record: {
                    content: '',
                    note: '',
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
            this.$http.get(`/records/${id}`).then(
                response => {
                    let data = response.data
                    console.log(data)
                    this.record = data
                    this.record.startTime = moment(this.record.startTime).format('YYYY-MM-DD HH:mm:ss')
                    this.record.endTime = moment(this.record.endTime).format('YYYY-MM-DD HH:mm:ss')
                    this.endTime = this.record.endTime

                    // this.$router.go(-1)
                },
                response => {
                    console.log(response)
                    this.loading = false
                })
        },
        methods: {
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
                let ret = window.confirm(`确认删除 ${this.record.content}？`)
                if (!ret) {
                    return
                }
                this.$http.delete(`/records/${this.record.id}`).then(
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
