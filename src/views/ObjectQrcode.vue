<template>
    <div title="物品详情" :page="page" backable>
        <ui-article class="article">
            <h2>{{ myObject.name }}</h2>
            <p>{{ myObject.note || '暂无介绍' }}</p>
        </ui-article>
    </div>
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
                qrcodeUrl: 'https://nodeapi.yunser.com/qrcode?content=123',
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
            this.ObjectId = this.$route.params.id
            this.$http.get(`/life/objects/${this.ObjectId}`).then(
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
        },
        methods: {
        }
    }
</script>

<style lang="scss" scoped>
.article {
    padding: 16px;
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
.btns {
    margin-bottom: 16px;
}
.qrcode {
    border: 1px solid #eee;
}
</style>
