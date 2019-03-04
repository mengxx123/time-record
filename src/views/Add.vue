<template>
    <my-page title="添加" backable>
        <ui-text-field class="input" v-model="title" label="打卡任务名称" />
        <br>
        <ui-raised-button primary label="添加" @click="finish" />
    </my-page>
</template>

<script>
    export default {
        data () {
            return {
                title: '',
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
        },
        methods: {
            finish() {
                if (!this.title) {
                    this.$message({
                        type: 'danger',
                        text: '请输入打卡内容'
                    })
                    return
                }
                let list = this.$storage.get('list', [])
                list.unshift({
                    id: '' + new Date().getTime(),
                    title: this.title,
                    times: 0,
                    lastTime: '',
                    createTime: new Date().getTime(),
                    updateTime: new Date().getTime()
                })
                this.$storage.set('list', list)
                this.$router.go(-1)
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
