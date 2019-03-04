<template>
    <my-page title="添加记录" backable>
        <ui-text-field class="input" v-model="record.content" label="内容" />
        <br>
        <ui-text-field class="input" v-model="record.note" label="备注" />
        <br>
        <ui-text-field class="input" v-model="record.startTime" label="开始时间" />
        <br>
        <ui-raised-button primary label="添加" @click="finish" />

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
                    startTime: moment().format('YYYY-MM-DD HH:mm:ss')
                },
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
                if (!this.record.content) {
                    this.$message({
                        type: 'danger',
                        text: '请输入内容'
                    })
                    return
                }
                this.$http.post(`/records`, {
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
