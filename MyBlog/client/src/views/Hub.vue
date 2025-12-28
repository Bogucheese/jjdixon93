<template>
  <div class="island-layout">
    <aside class="nav-island">
      <div class="logo-area">
        <div class="logo-box">M</div>
        <span class="logo-text" v-if="!isMobile">MySpace</span>
      </div>

      <nav class="menu-list">
        <div
          class="menu-item"
          :class="{ active: activeTab === 'feed' }"
          @click="switchTab('feed')"
        >
          <div class="icon-box">
            <el-icon><Compass /></el-icon>
          </div>
          <span class="label">广场</span>
        </div>
        <div
          class="menu-item"
          :class="{ active: activeTab === 'rank' }"
          @click="switchTab('rank')"
        >
          <div class="icon-box">
            <el-icon><Trophy /></el-icon>
          </div>
          <span class="label">榜单</span>
        </div>
        <div class="menu-item" @click="$router.push('/visual')">
          <div class="icon-box">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <span class="label">站内数据</span>
        </div>
        <div
          class="menu-item"
          v-if="isLogin"
          @click="$router.push('/dashboard')"
        >
          <div class="icon-box">
            <el-icon><UserFilled /></el-icon>
          </div>
          <span class="label">我的</span>
        </div>
        <div
          class="menu-item"
          v-if="isLogin"
          @click="$router.push('/settings')"
        >
          <div class="icon-box">
            <el-icon><Setting /></el-icon>
          </div>
          <span class="label">设置</span>
        </div>

        <div class="menu-item game-btn" @click="$router.push('/game')">
          <div class="icon-box">
            <el-icon><Coordinate /></el-icon>
          </div>
          <span class="label">摸鱼时刻</span>
          <div class="hot-badge">NEW</div>
        </div>

        <div class="menu-item" @click="$router.push('/changelog')">
          <div class="icon-box">
            <el-icon><Notebook /></el-icon>
          </div>
          <span class="label">开发日志</span>
        </div>
      </nav>

      <div class="action-area" v-if="activeTab === 'feed'">
        <div class="write-fab" @click="goWrite">
          <el-icon><EditPen /></el-icon>
        </div>
      </div>
    </aside>

    <main class="feed-island">
      <template v-if="activeTab === 'feed'">
        <div class="header-grid">
          <div class="welcome-card">
            <h2>探索未知的<br />灵感世界 ✨</h2>
          </div>
          <div class="search-card-container">
            <div class="search-tabs">
              <span
                :class="{ active: searchType === 'article' }"
                @click="searchType = 'article'"
                >文章</span
              >
              <span
                :class="{ active: searchType === 'user' }"
                @click="searchType = 'user'"
                >用户</span
              >
            </div>
            <el-input
              v-model="searchKey"
              :placeholder="
                searchType === 'article' ? '搜索文章...' : '搜索用户...'
              "
              prefix-icon="Search"
              class="island-input"
              @input="handleSearch"
              clearable
            />
          </div>
        </div>

        <div
          class="composer-island"
          @click="goWrite"
          v-if="searchType === 'article'"
        >
          <el-avatar
            :size="40"
            :src="isLogin ? currAvatar : ''"
            class="user-avatar"
          >
            {{ isLogin && currName ? currName.charAt(0) : "G" }}
          </el-avatar>
          <span class="placeholder">分享当下的想法...</span>
          <div class="mini-actions">
            <el-icon><Picture /></el-icon>
            <el-icon><VideoCamera /></el-icon>
          </div>
        </div>

        <div class="feed-stream" v-if="searchType === 'article'">
          <el-empty
            v-if="filteredArticles.length === 0 && !isLoading"
            description="没有找到相关文章"
          />

          <div
            v-for="item in filteredArticles"
            :key="item.id"
            class="post-island animate__animated animate__fadeInUp"
            @click="$router.push(`/article/${item.id}`)"
          >
            <div
              class="island-header"
              @click.stop="$router.push(`/blog/${item.user_id}`)"
            >
              <div class="author-pill">
                <el-avatar :size="24" :src="item.avatar">{{
                  item.username ? item.username.charAt(0) : "U"
                }}</el-avatar>
                <span class="name">{{ item.username }}</span>
              </div>
              <span class="time-tag">{{ formatTime(item.create_time) }}</span>
            </div>

            <div class="island-body">
              <h3>
                <span
                  v-if="searchKey && item.category.includes(searchKey)"
                  class="highlight-tag"
                  >#{{ item.category }}</span
                >
                {{ item.title }}
              </h3>
              <p>{{ item.summary || "点击阅读更多内容..." }}</p>
            </div>

            <div class="island-footer" @click.stop>
              <div class="stat-pill">
                <el-icon><View /></el-icon> {{ item.views }}
              </div>
              <div class="stat-pill" :class="{ active: item.is_liked }">
                <el-icon><Pointer /></el-icon> {{ item.likes_count }}
              </div>
              <div class="stat-pill">
                <el-icon><ChatLineRound /></el-icon> {{ item.comments_count }}
              </div>
              <div
                class="expand-btn"
                @click="toggleExpand(item)"
                :class="{ rotated: item.isExpanded }"
              >
                <el-icon><ArrowDown /></el-icon>
              </div>
            </div>

            <div v-if="item.isExpanded" class="interaction-drawer" @click.stop>
              <div class="quick-actions">
                <el-button
                  :type="item.is_liked ? 'danger' : 'default'"
                  round
                  size="small"
                  @click="handleLike(item)"
                >
                  <el-icon><Pointer /></el-icon>
                  {{ item.is_liked ? "已赞" : "点赞" }}
                </el-button>
                <el-button
                  :type="item.is_favorited ? 'warning' : 'default'"
                  round
                  size="small"
                  @click="handleFav(item)"
                >
                  <el-icon
                    ><StarFilled v-if="item.is_favorited" /><Star v-else
                  /></el-icon>
                  收藏
                </el-button>
                <el-button round size="small" @click="handleShare(item)">
                  <el-icon><Share /></el-icon> 分享
                </el-button>
              </div>
              <div class="mini-comments">
                <div
                  v-if="item.previewComments && item.previewComments.length > 0"
                >
                  <div
                    v-for="c in item.previewComments"
                    :key="c.id"
                    class="mc-item"
                  >
                    <span class="mc-user">{{ c.username }}:</span>
                    <span class="mc-text">{{ c.content }}</span>
                  </div>
                  <div
                    class="mc-more"
                    @click="$router.push(`/article/${item.id}`)"
                  >
                    查看全部评论 &gt;
                  </div>
                </div>
                <div v-else class="mc-empty">暂无评论，来做第一个吧~</div>
              </div>
              <div class="quick-input">
                <el-input
                  v-model="item.tempComment"
                  placeholder="说点什么..."
                  size="small"
                  @keyup.enter="handleQuickComment(item)"
                >
                  <template #append
                    ><el-button @click="handleQuickComment(item)"
                      >发送</el-button
                    ></template
                  >
                </el-input>
              </div>
            </div>
          </div>

          <div class="loading-state" v-if="!searchKey">
            <span v-if="isLoading"
              ><el-icon class="is-loading"><Compass /></el-icon>
              正在加载...</span
            >
            <span v-else-if="!hasMore && articles.length > 0" class="no-more"
              >—— 已经到底啦 ——</span
            >
          </div>
        </div>

        <div class="user-grid-stream" v-else>
          <el-empty
            v-if="searchedUsers.length === 0"
            description="没有找到该用户"
          />
          <div
            v-for="user in searchedUsers"
            :key="user.id"
            class="user-result-card"
            @click="$router.push(`/blog/${user.id}`)"
          >
            <el-avatar :size="60" :src="user.avatar" class="grid-avatar">{{
              user.username ? user.username.charAt(0) : "U"
            }}</el-avatar>
            <div class="grid-name">{{ user.username }}</div>
            <div class="grid-bio">{{ user.bio || "暂无简介" }}</div>
            <button class="visit-btn">访问主页</button>
          </div>
        </div>
      </template>

      <template v-else-if="activeTab === 'rank'">
        <div class="rank-header">
          <h2>🏆 荣誉殿堂</h2>
          <div class="rank-tabs">
            <div
              class="r-tab"
              :class="{ active: rankType === 'author' }"
              @click="rankType = 'author'"
            >
              影响力榜
            </div>
            <div
              class="r-tab"
              :class="{ active: rankType === 'article' }"
              @click="rankType = 'article'"
            >
              热门文章
            </div>
          </div>
        </div>
        <div
          v-if="rankType === 'author'"
          class="animate__animated animate__fadeIn"
        >
          <div
            class="podium-stage"
            v-if="rankAuthors && rankAuthors.length > 0"
          >
            <div
              class="podium-item silver"
              v-if="rankAuthors[1]"
              @click="$router.push(`/blog/${rankAuthors[1].id}`)"
            >
              <div class="crown">🥈</div>
              <el-avatar
                :size="60"
                :src="rankAuthors[1].avatar"
                class="p-avatar"
                >{{ rankAuthors[1].username.charAt(0) }}</el-avatar
              >
              <div class="p-name">{{ rankAuthors[1].username }}</div>
              <div class="p-score">{{ rankAuthors[1].fansCount }} 粉丝</div>
              <div class="p-bar"></div>
            </div>
            <div
              class="podium-item gold"
              v-if="rankAuthors[0]"
              @click="$router.push(`/blog/${rankAuthors[0].id}`)"
            >
              <div class="crown">👑</div>
              <el-avatar
                :size="80"
                :src="rankAuthors[0].avatar"
                class="p-avatar"
                >{{ rankAuthors[0].username.charAt(0) }}</el-avatar
              >
              <div class="p-name">{{ rankAuthors[0].username }}</div>
              <div class="p-score">{{ rankAuthors[0].fansCount }} 粉丝</div>
              <div class="p-bar"></div>
            </div>
            <div
              class="podium-item bronze"
              v-if="rankAuthors[2]"
              @click="$router.push(`/blog/${rankAuthors[2].id}`)"
            >
              <div class="crown">🥉</div>
              <el-avatar
                :size="60"
                :src="rankAuthors[2].avatar"
                class="p-avatar"
                >{{ rankAuthors[2].username.charAt(0) }}</el-avatar
              >
              <div class="p-name">{{ rankAuthors[2].username }}</div>
              <div class="p-score">{{ rankAuthors[2].fansCount }} 粉丝</div>
              <div class="p-bar"></div>
            </div>
          </div>

          <div class="rank-list">
            <div
              v-for="(user, index) in (rankAuthors || []).slice(3)"
              :key="user.id"
              class="rank-row"
              @click="$router.push(`/blog/${user.id}`)"
            >
              <div class="rank-num">{{ index + 4 }}</div>
              <el-avatar :size="40" :src="user.avatar">{{
                user.username ? user.username.charAt(0) : "U"
              }}</el-avatar>
              <div class="rank-info">
                <div class="r-name">{{ user.username }}</div>
                <div class="r-desc">{{ user.bio || "无简介" }}</div>
              </div>
              <div class="rank-val">{{ user.fansCount }} 粉丝</div>
            </div>
          </div>
        </div>
        <div
          v-if="rankType === 'article'"
          class="animate__animated animate__fadeIn"
        >
          <div class="rank-list article-mode">
            <div
              v-for="(art, index) in rankArticles"
              :key="art.id"
              class="rank-row"
              @click="$router.push(`/article/${art.id}`)"
            >
              <div class="rank-num" :class="{ 'top-three': index < 3 }">
                {{ index + 1 }}
              </div>
              <div class="rank-info">
                <div class="r-name">{{ art.title }}</div>
                <div class="r-desc">
                  作者: {{ art.username }} · {{ formatTime(art.create_time) }}
                </div>
              </div>
              <div class="rank-val fiery">
                <el-icon><View /></el-icon> {{ art.views }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>

    <aside class="widget-island">
      <div class="widget-box">
        <div class="widget-title">
          <span>推荐创作者</span>
          <el-icon><ArrowRight /></el-icon>
        </div>
        <div class="creator-list">
          <div
            v-for="user in (recommendUsers || []).slice(0, 5)"
            :key="user.id"
            class="creator-card"
            @click="$router.push(`/blog/${user.id}`)"
          >
            <el-avatar :size="48" :src="user.avatar" class="creator-avatar">{{
              user.username ? user.username.charAt(0) : "U"
            }}</el-avatar>
            <div class="creator-info">
              <div class="c-name">{{ user.username }}</div>
              <div class="c-bio">
                {{ user.bio ? user.bio.substring(0, 10) + "..." : "暂无简介" }}
              </div>
            </div>
            <div class="follow-icon">+</div>
          </div>
        </div>
      </div>
      <div class="widget-box">
        <div class="widget-title">
          <span>热门话题</span>
          <el-icon class="topic-icon"><Compass /></el-icon>
        </div>
        <div class="tags-cloud">
          <el-empty
            v-if="!hotTopics || hotTopics.length === 0"
            description="暂无话题"
            :image-size="40"
          />
          <span
            v-for="topic in hotTopics || []"
            :key="topic.category"
            class="hash-tag"
            :class="{ active: searchKey === topic.category }"
            @click="selectTopic(topic.category)"
          >
            #{{ topic.category }}
            <span class="tag-count">{{ topic.count }}</span>
          </span>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import api from "@/utils/api";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Compass,
  Trophy,
  UserFilled,
  Setting,
  EditPen,
  Search,
  Picture,
  VideoCamera,
  View,
  Star,
  StarFilled,
  ArrowRight,
  ArrowDown,
  Pointer,
  ChatLineRound,
  Share,
  Notebook,
  DataAnalysis,
} from "@element-plus/icons-vue";

const router = useRouter();

const activeTab = ref("feed");
const recommendUsers = ref([]);
const articles = ref([]);
const hotTopics = ref([]);
const searchKey = ref("");
const isLogin = !!localStorage.getItem("token");
const isMobile = ref(window.innerWidth < 768);
const currName = ref(localStorage.getItem("username") || "");
const currAvatar = ref("");

const page = ref(1);
const pageSize = 5;
const isLoading = ref(false);
const hasMore = ref(true);

const searchType = ref("article");
const searchedUsers = ref([]);
const rankType = ref("author");
const rankAuthors = ref([]);
const rankArticles = ref([]);

const getAuthConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const goWrite = () => {
  isLogin ? router.push("/editor") : router.push("/login");
};
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

const switchTab = async (tab) => {
  activeTab.value = tab;
  if (tab === "rank" && rankAuthors.value.length === 0) {
    await fetchRankData();
  }
};

const loadArticles = async (isReset = false) => {
  if (isLoading.value) return;
  if (isReset) {
    page.value = 1;
    articles.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;

  isLoading.value = true;
  try {
    const config = isLogin ? getAuthConfig() : {};
    const res = await api.get(`/hub/articles`, {
      params: { page: page.value, limit: pageSize },
      ...config,
    });

    if (res.data.code === 200) {
      const newArts = (res.data.data || []).map((item) => ({
        ...item,
        isExpanded: false,
        previewComments: [],
        tempComment: "",
      }));

      if (newArts.length < pageSize) hasMore.value = false;
      articles.value.push(...newArts);
      page.value++;
    }
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const handleScroll = () => {
  if (activeTab.value !== "feed" || searchKey.value) return;
  const scrollTop =
    document.documentElement.scrollTop || document.body.scrollTop;
  const clientHeight = document.documentElement.clientHeight;
  const scrollHeight = document.documentElement.scrollHeight;
  if (scrollTop + clientHeight >= scrollHeight - 50) loadArticles();
};

const toggleExpand = async (item) => {
  item.isExpanded = !item.isExpanded;
  if (item.isExpanded && item.previewComments.length === 0) {
    try {
      const res = await api.get(`/comments/${item.id}`);
      if (res.data.code === 200) {
        item.previewComments = (res.data.data || []).slice(0, 3);
      }
    } catch (e) {}
  }
};

const handleLike = async (item) => {
  if (!isLogin) return router.push("/login");
  try {
    const res = await api.post("/likes/toggle", { articleId: item.id });
    item.is_liked = res.data.isLiked;
    item.likes_count += res.data.isLiked ? 1 : -1;
  } catch (e) {}
};

const handleFav = async (item) => {
  if (!isLogin) return router.push("/login");
  try {
    const res = await api.post("/favorites/toggle", { articleId: item.id });
    item.is_favorited = res.data.isFavorited;
    item.fav_count += res.data.isFavorited ? 1 : -1;
    if (res.data.isFavorited) ElMessage.success("已收藏");
  } catch (e) {}
};

const handleQuickComment = async (item) => {
  if (!isLogin) return router.push("/login");
  if (!item.tempComment) return;
  try {
    const res = await api.post("/comments", {
      articleId: item.id,
      content: item.tempComment,
    });
    if (res.data.code === 200) {
      ElMessage.success("评论成功");
      item.previewComments.unshift({
        id: Date.now(),
        username: currName.value,
        content: item.tempComment,
      });
      item.comments_count++;
      item.tempComment = "";
    }
  } catch (e) {}
};

const handleShare = async (item) => {
  const url = `${window.location.origin}/article/${item.id}`;
  try {
    await navigator.clipboard.writeText(url);
    ElMessage.success("链接已复制");
  } catch (e) {
    ElMessage.info("复制失败");
  }
};

const fetchRankData = async () => {
  try {
    const res = await api.get("/hub/ranks");
    if (res.data.code === 200) {
      rankAuthors.value = res.data.data.authors || [];
      rankArticles.value = res.data.data.articles || [];
    }
  } catch (e) {
    console.error(e);
  }
};

const filteredArticles = computed(() => {
  if (!searchKey.value) return articles.value;
  const key = searchKey.value.toLowerCase();
  return articles.value.filter(
    (item) =>
      item.title.toLowerCase().includes(key) ||
      item.summary?.toLowerCase().includes(key) ||
      item.category?.toLowerCase().includes(key)
  );
});
const selectTopic = (category) => {
  searchType.value = "article";
  activeTab.value = "feed";
  if (searchKey.value === category) {
    searchKey.value = "";
  } else {
    searchKey.value = category;
  }
};
const handleSearch = async () => {
  if (searchType.value === "article") return;
  if (!searchKey.value) {
    searchedUsers.value = recommendUsers.value;
    return;
  }
  try {
    const res = await api.get(`/search/users?q=${searchKey.value}`);
    searchedUsers.value = res.data.data || [];
  } catch (e) {
    console.error(e);
  }
};
watch(searchType, (newVal) => {
  if (newVal === "user" && !searchKey.value)
    searchedUsers.value = recommendUsers.value;
  searchKey.value = "";
});
// Hub.vue 中的 fetchCurrentUser
const fetchCurrentUser = async () => {
  if (!isLogin) return;
  try {
    const res = await api.get("/user/info");
    if (res.data.code === 200) {
      currName.value = res.data.data.username;
      currAvatar.value = res.data.data.avatar;
      // ✨ 存入本地，方便游戏页面读取
      localStorage.setItem('avatar', res.data.data.avatar);
      localStorage.setItem('username', res.data.data.username);
    }
  } catch (e) {}
};

onMounted(async () => {
  try {
    // ✨ 修改点：在 Promise.all 中加入 api.post("/log-visit")
    const [resUsers, resTopics] = await Promise.all([
      api.get("/hub/users"),
      api.get("/hub/topics"),
      api.post("/log-visit").catch((e) => console.error("访客统计失败", e)),
      // 使用 .catch 确保即使统计接口报错，也不会影响页面其他数据的加载
    ]);

    recommendUsers.value = resUsers.data.data || [];
    searchedUsers.value = recommendUsers.value;
    hotTopics.value = resTopics.data.data || [];

    await loadArticles(true);
  } catch (err) {
    console.error("加载数据失败:", err);
  }

  fetchCurrentUser();
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth < 768;
  });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
/* 样式与 DashBoard 共享的部分相同，此处省略重复 CSS 以节省长度 */
/* Hub 特定样式 */
.island-layout {
  display: flex;
  justify-content: center;
  gap: 30px;
  min-height: 100vh;
  background-color: #f2f4f7;
  padding: 30px;
  font-family: "Plus Jakarta Sans", sans-serif;
  color: #2c3e50;
}
.nav-island {
  width: 260px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 30px;
  height: calc(100vh - 60px);
}
.logo-area {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 40px;
  padding-left: 10px;
}
.logo-box {
  width: 48px;
  height: 48px;
  background: #2c3e50;
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 24px;
  box-shadow: 0 10px 20px rgba(44, 62, 80, 0.3);
}
.logo-text {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -1px;
}
.menu-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 16px 20px;
  border-radius: 20px;
  background: white;
  color: #94a3b8;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
}
.menu-item:hover {
  transform: translateX(5px);
  color: #2c3e50;
}
.menu-item.active {
  background: #2c3e50;
  color: white;
  box-shadow: 0 8px 20px rgba(44, 62, 80, 0.25);
}
.menu-item .el-icon {
  font-size: 22px;
}
.menu-item .label {
  font-weight: 600;
  font-size: 16px;
}
.write-fab {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ff6b6b, #ee5d5d);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(238, 93, 93, 0.4);
  transition: transform 0.3s;
  margin-top: auto;
}
.write-fab:hover {
  transform: scale(1.1) rotate(90deg);
}
.feed-island {
  width: 600px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}
.header-grid {
  display: flex;
  gap: 20px;
  height: 140px;
}
.welcome-card {
  flex: 1.2;
  background: #2c3e50;
  border-radius: 24px;
  padding: 30px;
  color: white;
  display: flex;
  align-items: center;
  background-image: radial-gradient(circle at top right, #409eff, transparent);
}
.welcome-card h2 {
  font-size: 26px;
  line-height: 1.2;
  margin: 0;
}
.search-card-container {
  flex: 1;
  background: white;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}
.search-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 5px;
  padding-left: 5px;
}
.search-tabs span {
  font-size: 14px;
  color: #94a3b8;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
  position: relative;
}
.search-tabs span.active {
  color: #2c3e50;
}
.search-tabs span.active::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #409eff;
  border-radius: 2px;
}
:deep(.island-input .el-input__wrapper) {
  border-radius: 12px;
  background: #f2f4f7;
  box-shadow: none;
  padding: 10px;
}
.composer-island {
  background: white;
  border-radius: 24px;
  padding: 15px 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: 0.3s;
  border: 1px solid transparent;
}
.composer-island:hover {
  border-color: #409eff;
  box-shadow: 0 10px 30px rgba(64, 158, 255, 0.1);
}
.placeholder {
  flex: 1;
  color: #94a3b8;
  font-size: 15px;
}
.mini-actions {
  display: flex;
  gap: 15px;
  color: #94a3b8;
  font-size: 20px;
}
.post-island {
  background: white;
  border-radius: 24px;
  padding: 25px;
  cursor: pointer;
  transition: 0.3s;
  border: 1px solid rgba(0, 0, 0, 0.03);
  margin-bottom: 15px;
}
.post-island:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.06);
}
.island-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.author-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  padding: 4px 12px 4px 4px;
  border-radius: 30px;
}
.name {
  font-weight: 700;
  font-size: 14px;
}
.time-tag {
  font-size: 12px;
  color: #cbd5e1;
}
.island-body h3 {
  font-size: 20px;
  margin: 0 0 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
}
.highlight-tag {
  color: #409eff;
  font-size: 16px;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 6px;
}
.island-body p {
  font-size: 15px;
  color: #64748b;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.island-footer {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.stat-pill {
  background: #f8fafc;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
}
.stat-pill.active {
  color: #ff6b6b;
  background: #fff0f0;
}
.category-pill {
  margin-left: auto;
  background: #ecf5ff;
  color: #409eff;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}
.expand-btn {
  margin-left: auto;
  padding: 6px;
  cursor: pointer;
  color: #cbd5e1;
  transition: 0.3s;
}
.expand-btn:hover {
  color: #409eff;
}
.expand-btn.rotated {
  transform: rotate(180deg);
  color: #409eff;
}
.interaction-drawer {
  margin-top: 15px;
  border-top: 1px dashed #f1f5f9;
  padding-top: 15px;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.quick-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
.mini-comments {
  background: #f8fafc;
  padding: 12px;
  border-radius: 12px;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 15px;
}
.mc-item {
  margin-bottom: 6px;
}
.mc-user {
  font-weight: bold;
  color: #2c3e50;
  margin-right: 5px;
}
.mc-more {
  color: #409eff;
  font-size: 12px;
  margin-top: 8px;
  cursor: pointer;
}
.mc-empty {
  text-align: center;
  color: #cbd5e1;
  font-size: 12px;
}
.user-grid-stream {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}
.user-result-card {
  background: white;
  border-radius: 24px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: 0.3s;
  cursor: pointer;
  border: 1px solid transparent;
}
.user-result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.05);
  border-color: #e2e8f0;
}
.grid-avatar {
  background: #2c3e50;
  margin-bottom: 15px;
  font-size: 24px;
  border: 4px solid #f8fafc;
}
.grid-name {
  font-weight: 800;
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 5px;
}
.grid-bio {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 20px;
  line-height: 1.4;
  height: 36px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.visit-btn {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  width: 100%;
}
.visit-btn:hover {
  background: #409eff;
}
.rank-header {
  background: #2c3e50;
  color: white;
  border-radius: 24px;
  padding: 30px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-image: radial-gradient(
    circle at bottom left,
    #8b5cf6,
    transparent
  );
}
.rank-header h2 {
  margin: 0;
  font-size: 24px;
}
.rank-tabs {
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 5px;
  border-radius: 12px;
}
.r-tab {
  padding: 6px 15px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: 0.2s;
}
.r-tab.active {
  background: white;
  color: #2c3e50;
}
.podium-stage {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 15px;
  margin-bottom: 30px;
  height: 260px;
}
.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 110px;
  cursor: pointer;
  transition: 0.3s;
  position: relative;
}
.podium-item:hover {
  transform: translateY(-5px);
}
.crown {
  font-size: 24px;
  margin-bottom: 5px;
  filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.2));
}
.p-avatar {
  border: 4px solid white;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}
.p-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 2px;
  width: 100%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.p-score {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 10px;
}
.p-bar {
  width: 100%;
  border-radius: 12px 12px 0 0;
}
.gold .p-bar {
  height: 120px;
  background: linear-gradient(to top, #ffd700, #fde68a);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}
.silver .p-bar {
  height: 90px;
  background: linear-gradient(to top, #c0c0c0, #e5e7eb);
}
.bronze .p-bar {
  height: 70px;
  background: linear-gradient(to top, #cd7f32, #fdba74);
}
.rank-list {
  background: white;
  border-radius: 24px;
  padding: 10px;
}
.rank-row {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 16px;
  transition: 0.2s;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
}
.rank-row:last-child {
  border-bottom: none;
}
.rank-row:hover {
  background: #f8fafc;
}
.rank-num {
  font-weight: 900;
  font-size: 18px;
  color: #cbd5e1;
  width: 30px;
  text-align: center;
}
.rank-info {
  flex: 1;
}
.r-name {
  font-weight: bold;
  color: #2c3e50;
  font-size: 15px;
}
.r-desc {
  font-size: 12px;
  color: #94a3b8;
}
.rank-val {
  font-weight: bold;
  color: #409eff;
  font-size: 13px;
}
.article-mode .rank-num.top-three {
  color: #ff6b6b;
  font-size: 22px;
}
.fiery {
  color: #ff6b6b;
  display: flex;
  align-items: center;
  gap: 5px;
}
.widget-island {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}
.widget-box {
  background: white;
  border-radius: 24px;
  padding: 25px;
}
.widget-title {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.creator-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.creator-card {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: 0.2s;
}
.creator-card:hover .c-name {
  color: #409eff;
}
.creator-info {
  flex: 1;
  overflow: hidden;
}
.c-name {
  font-weight: 700;
  font-size: 15px;
}
.c-bio {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.follow-icon {
  width: 28px;
  height: 28px;
  background: #f2f4f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #2c3e50;
  transition: 0.2s;
}
.creator-card:hover .follow-icon {
  background: #2c3e50;
  color: white;
}
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.hash-tag {
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid transparent;
}
.hash-tag:hover {
  background: white;
  border-color: #409eff;
  color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(64, 158, 255, 0.1);
}
.hash-tag.active {
  background: #409eff;
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}
.tag-count {
  font-size: 11px;
  background: rgba(0, 0, 0, 0.05);
  padding: 1px 5px;
  border-radius: 6px;
}
.hash-tag.active .tag-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}
.loading-state {
  text-align: center;
  padding: 20px 0;
  color: #94a3b8;
  font-size: 14px;
}
.no-more {
  color: #cbd5e1;
  font-size: 12px;
}

@media (max-width: 1200px) {
  .widget-island {
    display: none;
  }
}
@media (max-width: 768px) {
  .nav-island {
    display: none;
  }
  .feed-island {
    width: 100%;
  }
  .header-grid {
    flex-direction: column;
    height: auto;
  }
}
.game-btn {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe) !important;
  color: white !important;
  position: relative;
  overflow: hidden;
}
.hot-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ff7675;
  font-size: 9px;
  padding: 2px 5px;
  border-radius: 5px;
  font-weight: 900;
}
</style>