<template>
    <v-avatar :color="color" :size="size" :data-user-id="user.id">
        <v-img :src="image" v-if="image" :width="size" :height="size"/>
        <div class="name-char" v-else>
            <span class="char" :style="cssChar">{{ nameChar }}</span>
        </div>
    </v-avatar>
</template>
<script lang="ts">
import { UserModel } from "@/models"
import { Component, Prop, Vue } from "vue-property-decorator"

@Component({
    name: "cpn-user-avatar"
})
export default class UserAvatar extends Vue {
    @Prop({ default: () => new UserModel.User() })
    private user!: UserModel.User

    @Prop({ default: 48 })
    private size!: number

    @Prop({ default: "primary" })
    private color!: string

    private get nameChar() {
        const name = this.user.fullName
        return name.length > 0 ? name[0].toUpperCase() : ""
    }

    private get cssChar() {
        return {
            "font-size": (this.size * 0.5) + "px"
        }
    }

    private get image() {
        return this.user.image
    }
}
</script>
<style lang="scss" scoped>
.name-char {
    display: flex;
    justify-content: center;
    align-content: center;

    .char {
        font-weight: 500;
        color: white;
    }
}
</style>