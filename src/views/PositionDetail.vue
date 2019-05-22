<template>
    <my-page title="位置详情" :page="page" backable>
        <div class="common-container">
            <ui-article>
                <h2>名称：{{ myObject.name }}</h2>
                <p>备注：{{ myObject.note || '无' }}</p>
                <!-- <p>记录时间：{{ myObject.createTime }}</p> -->
                <!-- <p v-if="myObject.duration">持续时间：{{ myObject.duration }} 秒</p> -->
                <!-- <p v-if="myObject.duration">结束时间：{{ myObject.endTime }}</p> -->
            </ui-article>
            <h2 class="pui-section—title">物品（{{ objects.length }}）</h2>
            <div class="empty" v-if="!objects.length">没有物品</div>
            <ul class="record-list">
                <li class="item" v-for="item, index in objects" :key="index">
                    <router-link :to="`/objects/${item.id}`">
                        <div class="content">{{ item.name }}</div>
                    </router-link>
                    <!-- <div class="time">{{ item.startTime | time }}</div>
                    <div class="time" v-if="item.duration">{{ item.duration | duration }}</div>
                    <div @click="remove(item, index)">删除</div>
                    <div @click="finish(item, index)" v-if="!item.duration">刚刚完成</div> -->

                </li>
            </ul>
        </div>
        <ui-float-button class="float-button" icon="add" secondary @click="add" />
    </my-page>
</template>

<script>
    const moment = window.moment

    export default {
        data () {
            return {
                myObject: {
                    content: '',
                    note: '',
                },
                objects: [],
                minute: null,
                endTime: '',
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
            let id = this.$route.params.id
            this.$http.get(`/life/positions/${id}`).then(
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
            this.$http.get(`/life/objects?positionId=${id}&page_size=9999`).then(
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
        },
        methods: {
            add() {
                this.$router.push(`/object/add?positionId=${this.myObject.id}`)
            },
            edit() {
                this.$router.push(`/positions/${this.$route.params.id}/edit`)
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
                this.$http.delete(`/life/positions/${this.myObject.id}`).then(
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
