import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import PostsView from '../views/PostsView.vue'
import PostDetailView from '../views/PostDetailView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AccountView from '../views/AccountView.vue'
import CreatePostView from '../views/CreatePostView.vue'
import EditPostView from '../views/EditPostView.vue'
import UserPostsView from '../views/UserPostsView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  { path: '/', component: PostsView },
  { path: '/posts/:id', component: PostDetailView },
  { path: '/login', component: LoginView, meta: { guestOnly: true } },
  { path: '/register', component: RegisterView, meta: { guestOnly: true } },
  { path: '/account', component: AccountView, meta: { requiresAuth: true } },
  { path: '/posts/new', component: CreatePostView, meta: { requiresAuth: true } },
  { path: '/posts/:id/edit', component: EditPostView, meta: { requiresAuth: true } },
  { path: '/users/:userId/posts', component: UserPostsView },
  { path: '/:pathMatch(.*)*', component: NotFoundView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (auth.token && !auth.user) {
    try {
      await auth.fetchMe()
    } catch {
      auth.logout()
    }
  }
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { next: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return '/'
  }
})

export default router
