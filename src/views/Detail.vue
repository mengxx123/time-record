<template>
    <my-page :title="title" backable>
        <div class="empty" v-if="!logs.length">
            <div class="text">没有打卡记录</div>
        </div>
        <ul class="record-list">
            <li class="item" v-for="item, index in sortedLogs">
                <div class="left">
                    <div class="times" @click="view(item, index)">{{ item.time | time }}</div>
                </div>
                <div class="right">
                    <!-- <ui-raised-button class="sign" primary label="打卡" @click="sign(item, index)" /> -->
                    <br>
                    <!-- <a href="#" @click="remove(item, index)">删除</a> -->
                </div>
            </li>
        </ul>
    </my-page>
</template>

<script>
    const moment = window.moment

    export default {
        data () {
            return {
                record: {},
                logs: [],
                title: '打卡记录',
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
        computed: {
            sortedLogs() {
                return this.logs.sort((a, b) => {
                    // if (!a.updateTime && !b.updateTime) {
                    //     return 0
                    // }
                    return b.updateTime - a.updateTime
                })
            }
        },
        mounted() {
            this.taskId = this.$route.params.id
            let list = this.$storage.get('list', [])
            for (let item of list) {
                if (item.id === this.taskId) {
                    this.task = item
                    this.title = this.task.title
                    console.log(this.task)
                    this.loadLogs()
                    break
                }
            }
        },
        methods: {
            loadLogs() {
                let logs = this.$storage.get('logs', [])
                this.logs = logs.filter(i => i.taskId === this.task.id)
                console.log('this.logs', this.logs)
            },
            add() {
                this.$router.push('/add')
            },
            sign(item, index) {
                this.list[index].times++
                this.list[index].lastTime = new Date().getTime()
                this.list[index].updateTime = new Date().getTime()
                this.list = this.list.sort((a, b) => {
                    // if (!a.updateTime && !b.updateTime) {
                    //     return 0
                    // }
                    return b.updateTime - a.updateTime
                })
                this.$storage.set('list', this.list)
                let logs = this.$storage.get('logs', [])
                logs.push({
                    id: this.list[index].id,
                    time: new Date().getTime()
                })
                this.$storage.set('logs', logs)
            },
            remove(item, index) {
                let ret = window.confirm('确认删除？')
                if (!ret) {
                    return
                }
                this.list.splice(index, 1)
                this.$storage.set('list', this.list)
                let logs = this.$storage.get('logs', [])
                logs = logs.filter(i => i.id !== item.id)
                this.$storage.set('logs', logs)
            }
        },
        filters: {
            time(value) {
                if (!value) {
                    return '--'
                }
                return moment(new Date(value)).format('YYYY-MM-DD HH:mm')
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
        cursor: pointer;
    }
    .times {
        color: #666;
        cursor: pointer;
    }
}
.float-button {
    position: fixed;
    right: 24px;
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
</style>
