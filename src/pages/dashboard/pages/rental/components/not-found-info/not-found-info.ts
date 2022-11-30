import { Component, Vue } from "vue-property-decorator"

@Component
export default class NotFoundInfoModalComponent extends Vue {
    private closeModal (toggle: boolean) {
        this.$emit("show", toggle)
    }
}
