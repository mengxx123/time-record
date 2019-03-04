<template>
    <my-page title="统计" backable>
        <div>总记录天数：{{ day }}</div>
    </my-page>
</template>

<script>
    export default {
        data () {
            return {
                day: 0,
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
            // let id = this.$route.params.id
            this.$http.get(`/record/stat`).then(
                response => {
                    let data = response.data
                    console.log(data)
                    this.day = data
                    // this.$router.go(-1)
                },
                response => {
                    console.log(response)
                    this.loading = false
                })
        },
        methods: {
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
