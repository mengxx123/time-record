
<template>
    <my-page :title="title" :page="page" backable>
        <div class="common-container">
            <ui-text-field class="input" v-model="myObject.locationName" label="名称" />

            <!-- <br>
            <ui-text-field class="input" type="number" v-model.number="myObject.number" label="数量" /> -->

            <!-- <br>
            <ui-text-field class="input" type="number" v-model.number="myObject.price" label="价格" />  -->


            <br>
            <ui-text-field v-model="myObject.note" label="备注" multiLine :rows="3" :rowsMax="6"/>


            <!-- <div v-if="editType === 'update'">
                <br>
                <ui-text-field class="input" v-model="myObject.buyTime" label="购买时间" />
            </div> -->

            <br>
            <!-- <ui-select-field v-model="myObject.positionId" label="位置">
                <ui-menu-item :value="position.id" :title="position.name" v-for="position in positions" :key="position.id" />
            </ui-select-field> -->

            <!-- <br>
            <ui-raised-button primary label="保存" @click="finish" /> -->
        </div>
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
                            icon: 'check',
                            click: this.finish,
                            title: '保存'
                        }
                    ]
                }
            }
        },
        mounted() {
            let id = this.$route.params.id
            if (id) {
                this.editType = 'update'
                this.title = '修改物品'
                this.$http.get(`/location_logs/${id}`).then(
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
                this.title = '添加足迹'
                if (this.$route.query.positionId) {
                    this.myObject.positionId = this.$route.query.positionId
                }
            }
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
                if (!this.myObject.locationName) {
                    this.$message({
                        type: 'danger',
                        text: '请输入名称'
                    })
                    return
                }
                if (this.editType === 'update') {
                    this.$http.put(`/location_logs/${this.myObject.id}`, {
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
                    this.$http.post(`/location_logs`, {
                        ...this.myObject,
                        // objectId: this.$route.query.objectId,
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
.container {
    width: 400px;
    max-width: 100%;
    margin: 0 auto;
}
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
