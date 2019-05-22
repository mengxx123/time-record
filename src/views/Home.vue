<template>
    <my-page title="打卡" :page="page">
        <div class="empty" v-if="!list.length">
            <div class="text">没有任务，请点击「+」添加任务</div>
        </div>
        <ul class="record-list">
            <li class="item" v-for="item, index in sortedLogs">
                <div class="left">
                    <div class="title" @click="view(item, index)">{{ item.title }}</div>
                    <div class="times" @click="view(item, index)">次数：{{ item.times }}</div>
                    <div class="times" @click="view(item, index)">最近打卡时间：{{ item.lastTime | time }}</div>
                </div>
                <div class="right">
                    <ui-raised-button class="sign" primary label="打卡" @click="sign(item, index)" />
                    <br>
                    <a href="#" @click="remove(item, index)">删除</a>
                </div>
            </li>
        </ul>
        <ui-float-button class="float-button" icon="add" secondary @click="add" />
        <!-- <ui-float-button class="float-button2" icon="delete" secondary @click="clear()" /> -->
    </my-page>
</template>

<script>
    const moment = window.moment

    export default {
        data () {
            return {
                list: [
                    {
                        title: '吃饭',
                        times: 6,
                        lastTime: '2018-12-30 16:02:67'
                    },
                    {
                        title: '哈哈',
                        times: 8,
                        lastTime: '2019-01-12 17:02:67'
                    }
                ],
                page: {
                    menu: [
                        {
                            type: 'icon',
                            icon: 'delete',
                            click: this.clear,
                            title: '清空记录'
                        },
                        {
                            type: 'icon',
                            icon: 'apps',
                            href: 'https://app.yunser.com?utm_source=timerecord',
                            target: '_blank',
                            title: '应用'
                        }
                    ]
                }
            }
        },
        mounted() {
            this.list = this.$storage.get('list', [])
        },
        computed: {
            sortedLogs() {
                return this.list.sort((a, b) => {
                    // if (!a.updateTime && !b.updateTime) {
                    //     return 0
                    // }
                    return b.updateTime - a.updateTime
                })
            }
        },
        methods: {
            view(item, index) {
                this.$router.push(`/records1/${item.id}`)
            },
            add() {
                this.$router.push('/add')
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
                let ret = window.confirm('确认删除？')
                if (!ret) {
                    return
                }
                this.list.splice(index, 1)
                this.$storage.set('list', this.list)
                let logs = this.$storage.get('logs', [])
                logs = logs.filter(i => i.id !== item.id)
                this.$storage.set('logs', logs)
            },
            clear() {
                let ret = window.confirm('清空所有记录？')
                if (!ret) {
                    return
                }
                this.list = []
                this.$storage.set('list', this.list)
                this.$storage.set('logs', [])
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
</style>
