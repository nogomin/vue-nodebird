<template>
    <v-container>
        <div>
            <PostCard/>
            <PostCard/>
            <PostCard/>
            <PostCard/>
            <PostCard/>
        </div>
    </v-container>
</template>

<script>
import PostCard from '~/components/PostCard';

export default {
    components: {
        PostCard,
    },
    data() {
        return {
            name: 'Nuxt.js',
        }
    }
}
</script>

<style scoped>

</style>