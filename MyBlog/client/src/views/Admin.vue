<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo">Admin Panel</div>
      <div class="menu">
        <div
          class="menu-item"
          :class="{ active: currentTab === 'dashboard' }"
          @click="currentTab = 'dashboard'"
        >
          <el-icon><Odometer /></el-icon> 仪表盘
        </div>
        <div
          class="menu-item"
          :class="{ active: currentTab === 'users' }"
          @click="currentTab = 'users'"
        >
          <el-icon><User /></el-icon> 用户管理
        </div>
        <div
          class="menu-item"
          :class="{ active: currentTab === 'articles' }"
          @click="currentTab = 'articles'"
        >
          <el-icon><Document /></el-icon> 文章管理
        </div>
        <div
          class="menu-item"
          :class="{ active: currentTab === 'carousels' }"
          @click="currentTab = 'carousels'"
        >
          <el-icon><Picture /></el-icon> 轮播设置
        </div>
        <div
          class="menu-item"
          :class="{ active: currentTab === 'reports' }"
          @click="currentTab = 'reports'"
        >
          <el-icon><Warning /></el-icon> 举报审核
        </div>
        <div
          class="menu-item"
          :class="{ active: currentTab === 'logs' }"
          @click="currentTab = 'logs'"
        >
          <el-icon><Notebook /></el-icon> 开发日志
        </div>
      </div>
      <div class="logout" @click="$router.push('/')">
        <el-icon><Back /></el-icon> 返回前台
      </div>
    </aside>

    <main class="content" v-loading="loading">
      <header>
        <h2>{{ tabName }}</h2>
        <div class="user-info">管理员</div>
      </header>

      <div v-if="currentTab === 'dashboard'">
        <div class="dashboard-grid">
          <div class="stat-card">
            <div class="label">真实访客人次</div>
            <div class="num" style="color: #67c23a">
              {{ stats.visitorCount }}
            </div>
          </div>
          <div class="stat-card">
            <div class="label">总用户数</div>
            <div class="num">{{ stats.userCount }}</div>
          </div>
          <div class="stat-card">
            <div class="label">文章总数</div>
            <div class="num">{{ stats.articleCount }}</div>
          </div>
          <div class="stat-card">
            <div class="label">全站阅读量</div>
            <div class="num">{{ stats.viewCount }}</div>
          </div>
          <div class="stat-card">
            <div class="label">评论互动量</div>
            <div class="num">{{ stats.commentCount || 0 }}</div>
          </div>
        </div>

        <div
          class="charts-container"
          style="margin-top: 30px"
          v-if="hasChartData"
        >
          <div class="charts-row">
            <div class="chart-box wide">
              <h3>📈 近7天用户注册趋势</h3>
              <div ref="chartUser" class="chart"></div>
            </div>
            <div class="chart-box">
              <h3>🍰 文章分类构成</h3>
              <div ref="chartCategory" class="chart"></div>
            </div>
          </div>

          <div class="charts-row">
            <div class="chart-box">
              <h3>⭕ 内容发布状态</h3>
              <div ref="chartStatus" class="chart"></div>
            </div>
            <div class="chart-box wide">
              <h3>🏆 流量作者 Top 5</h3>
              <div ref="chartAuthor" class="chart"></div>
            </div>
          </div>

          <div class="charts-row">
            <div class="chart-box wide" style="width: 100%">
              <h3>🔥 社区评论活跃度</h3>
              <div ref="chartComment" class="chart"></div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无图表数据，可能是数据库刚被清洗" />
      </div>

      <div v-if="currentTab === 'users'" class="table-container">
        <div class="toolbar">
          <el-input
            v-model="userSearch"
            placeholder="搜索用户名..."
            style="width: 200px"
            @input="fetchUsers"
          />
        </div>
        <el-table :data="users" style="width: 100%">
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column label="用户">
            <template #default="scope">
              <div style="display: flex; align-items: center; gap: 10px">
                <el-avatar :size="30" :src="scope.row.avatar">{{
                  scope.row.username ? scope.row.username.charAt(0) : "U"
                }}</el-avatar>
                {{ scope.row.username }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="role" label="角色" width="100" />
          <el-table-column prop="credit_score" label="信誉分" width="100">
            <template #default="scope">
              <el-tag
                :type="scope.row.credit_score < 60 ? 'danger' : 'success'"
                >{{ scope.row.credit_score }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="scope">
              <el-tag v-if="scope.row.status === 0" type="danger"
                >永久封禁</el-tag
              >
              <el-tag v-else type="success">正常</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                size="small"
                type="warning"
                @click="unfreezeUser(scope.row.id)"
                >解冻</el-button
              >
              <el-button
                size="small"
                :type="scope.row.status === 1 ? 'danger' : 'success'"
                @click="toggleUserStatus(scope.row)"
              >
                {{ scope.row.status === 1 ? "封禁" : "解封" }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="currentTab === 'articles'" class="table-container">
        <div class="toolbar">
          <el-input
            v-model="articleSearch"
            placeholder="搜索标题..."
            style="width: 200px"
            @input="fetchArticles"
          />
        </div>
        <el-table :data="articles" style="width: 100%">
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="title" label="标题" show-overflow-tooltip />
          <el-table-column prop="username" label="作者" width="150" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="create_time" label="发布时间" width="180">
            <template #default="scope">{{
              new Date(scope.row.create_time).toLocaleDateString()
            }}</template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button
                size="small"
                type="danger"
                @click="deleteArticle(scope.row.id)"
                >强制下架</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="currentTab === 'carousels'" class="table-container">
        <div class="log-form">
          <h3>添加新轮播图</h3>
          <div class="upload-area">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :http-request="handleUpload"
            >
              <img
                v-if="carouselForm.url"
                :src="carouselForm.url"
                class="avatar-preview"
              />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>

            <div class="form-inputs">
              <el-input
                v-model="carouselForm.name"
                placeholder="请输入轮播图标题/描述"
              />
              <el-input
                v-model="carouselForm.url"
                placeholder="图片链接 (上传后自动生成)"
                disabled
              >
                <template #prepend>链接</template>
              </el-input>
              <el-button
                type="primary"
                @click="addCarousel"
                :disabled="!carouselForm.url"
                >确认添加</el-button
              >
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #909399">
            点击左侧方框上传图片，支持 JPG/PNG。上传成功后点击“确认添加”。
          </div>
        </div>

        <el-divider />

        <h3>当前轮播列表</h3>
        <el-table :data="carouselList" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="预览" width="180">
            <template #default="scope">
              <el-image
                style="
                  width: 120px;
                  height: 68px;
                  border-radius: 8px;
                  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                "
                :src="scope.row.url"
                fit="cover"
                :preview-src-list="[scope.row.url]"
                preview-teleported
              />
            </template>
          </el-table-column>
          <el-table-column prop="name" label="标题" />
          <el-table-column prop="url" label="链接" show-overflow-tooltip />
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="deleteCarousel(scope.row.id)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="carouselList.length === 0" description="暂无轮播图" />
      </div>

      <div v-if="currentTab === 'reports'" class="table-container">
        <el-table :data="reports" style="width: 100%">
          <el-table-column prop="reason" label="举报理由" />
          <el-table-column
            prop="comment_content"
            label="违规评论内容"
            show-overflow-tooltip
          />
          <el-table-column prop="offender_name" label="违规者" width="120" />
          <el-table-column prop="credit_score" label="当前信誉" width="100" />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="handleReport(scope.row, false)"
                >仅删评</el-button
              >
              <el-button
                size="small"
                type="danger"
                @click="handleReport(scope.row, true)"
                >删评并扣分</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="reports.length === 0" description="暂无待处理举报" />
      </div>

      <div v-if="currentTab === 'logs'" class="table-container">
        <div class="log-form">
          <h3>发布新版本日志</h3>
          <div class="form-row">
            <el-input
              v-model="logForm.version"
              placeholder="版本号 (e.g. v1.0.2)"
              style="width: 150px"
            />
            <el-select
              v-model="logForm.type"
              placeholder="类型"
              style="width: 120px"
            >
              <el-option label="功能 Feat" value="feat" />
              <el-option label="修复 Fix" value="fix" />
              <el-option label="优化 Perf" value="perf" />
            </el-select>
            <el-input
              v-model="logForm.author"
              placeholder="提交人"
              style="width: 120px"
            />
          </div>
          <el-input
            v-model="logForm.content"
            type="textarea"
            :rows="3"
            placeholder="更新内容详情..."
            style="margin-top: 10px"
          />
          <el-button type="primary" style="margin-top: 10px" @click="publishLog"
            >发布日志</el-button
          >
        </div>

        <el-divider />

        <h3>历史日志</h3>
        <el-table :data="devLogs" style="width: 100%">
          <el-table-column prop="version" label="版本" width="100" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="scope">
              <el-tag>{{ scope.row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="内容" />
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="deleteLog(scope.row.id)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, nextTick, watch } from "vue";
import api from "@/utils/api";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
// ✨ 引入 Plus 图标用于上传按钮
import {
  Odometer,
  User,
  Document,
  Warning,
  Back,
  Notebook,
  Picture,
  Plus,
} from "@element-plus/icons-vue";
import * as echarts from "echarts";

const router = useRouter();
const currentTab = ref("dashboard");
const loading = ref(false);

const stats = ref({
  userCount: 0,
  articleCount: 0,
  viewCount: 0,
  commentCount: 0,
});
const chartsData = ref({});
const users = ref([]);
const articles = ref([]);
const reports = ref([]);
const devLogs = ref([]);

// 轮播图数据
const carouselList = ref([]);
const carouselForm = reactive({ name: "", url: "" });

// 图表 DOM
const chartUser = ref(null);
const chartCategory = ref(null);
const chartStatus = ref(null);
const chartAuthor = ref(null);
const chartComment = ref(null);

const userSearch = ref("");
const articleSearch = ref("");
const logForm = reactive({
  version: "",
  type: "feat",
  content: "",
  author: "Admin",
});

const tabName = computed(() => {
  const map = {
    dashboard: "仪表盘",
    users: "用户管理",
    articles: "文章管理",
    reports: "举报审核",
    logs: "开发日志",
    carousels: "轮播设置",
  };
  return map[currentTab.value];
});

const hasChartData = computed(() => {
  return (
    chartsData.value &&
    chartsData.value.userTrend &&
    chartsData.value.userTrend.length > 0
  );
});

const fetchStats = async () => {
  loading.value = true;
  try {
    const res = await api.get("/admin/stats");
    if (res.data.code === 200) {
      const data = res.data.data || {};
      stats.value = data.cards || {
        userCount: 0,
        articleCount: 0,
        viewCount: 0,
        commentCount: 0,
      };
      chartsData.value = data.charts || {};
      nextTick(() => {
        initCharts();
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const initCharts = () => {
  if (!hasChartData.value) return;
  const init = (domRef, options) => {
    if (!domRef) return;
    if (echarts.getInstanceByDom(domRef)) echarts.dispose(domRef);
    const chart = echarts.init(domRef);
    chart.setOption(options);
  };
  init(chartUser.value, {
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: chartsData.value.userTrend.map((i) => i.date),
    },
    yAxis: { type: "value" },
    series: [
      {
        data: chartsData.value.userTrend.map((i) => i.count),
        type: "line",
        smooth: true,
        areaStyle: {},
        itemStyle: { color: "#409EFF" },
      },
    ],
  });
  init(chartCategory.value, {
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: chartsData.value.categoryDist.map((i) => ({
          value: i.count,
          name: i.category,
        })),
        itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
      },
    ],
  });
  init(chartStatus.value, {
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: "50%",
        data: chartsData.value.statusDist.map((i) => ({
          value: i.count,
          name: i.status === "published" ? "已发布" : "草稿",
        })),
        color: ["#67C23A", "#909399"],
      },
    ],
  });
  init(chartAuthor.value, {
    tooltip: { trigger: "axis" },
    grid: { left: "3%", right: "10%", bottom: "3%", containLabel: true },
    xAxis: { type: "value" },
    yAxis: {
      type: "category",
      data: chartsData.value.topAuthors.map((i) => i.username),
    },
    series: [
      {
        data: chartsData.value.topAuthors.map((i) => i.total_views),
        type: "bar",
        itemStyle: { color: "#E6A23C" },
      },
    ],
  });
  init(chartComment.value, {
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: chartsData.value.commentTrend.map((i) => i.date),
    },
    yAxis: { type: "value" },
    series: [
      {
        data: chartsData.value.commentTrend.map((i) => i.count),
        type: "line",
        smooth: true,
        areaStyle: { opacity: 0.5 },
        itemStyle: { color: "#8e44ad" },
      },
    ],
  });
};

// ✨✨✨ 轮播图管理逻辑 (新增上传)
const fetchCarousels = async () => {
  try {
    const res = await api.get("/admin/carousels");
    if (res.data.code === 200) {
      carouselList.value = res.data.data || [];
    }
  } catch (e) {}
};

// ✨✨✨ 上传图片处理函数
const handleUpload = async (options) => {
  const { file } = options;
  const formData = new FormData();
  formData.append("file", file);

  try {
    // 调用后端的上传接口
    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data.code === 200) {
      // 上传成功，将 URL 填入表单
      carouselForm.url = res.data.url;
      ElMessage.success("图片上传成功");
    }
  } catch (e) {
    ElMessage.error("上传失败，请检查文件大小");
  }
};

const addCarousel = async () => {
  if (!carouselForm.name || !carouselForm.url)
    return ElMessage.warning("请填写完整");
  try {
    await api.post("/admin/carousels", carouselForm);
    ElMessage.success("添加成功");
    carouselForm.name = "";
    carouselForm.url = "";
    fetchCarousels();
  } catch (e) {
    ElMessage.error("添加失败");
  }
};

const deleteCarousel = async (id) => {
  try {
    await ElMessageBox.confirm("确定删除该轮播图？");
    await api.delete(`/admin/carousels/${id}`);
    ElMessage.success("已删除");
    fetchCarousels();
  } catch (e) {}
};

watch(currentTab, (newTab) => {
  if (newTab === "dashboard") {
    nextTick(() => {
      initCharts();
    });
  } else if (newTab === "carousels") {
    fetchCarousels();
  }
});

const fetchUsers = async () => {
  try {
    const res = await api.get(`/admin/users?q=${userSearch.value}`);
    users.value = res.data.data || [];
  } catch (e) {}
};
const fetchArticles = async () => {
  try {
    const res = await api.get(`/admin/articles?q=${articleSearch.value}`);
    articles.value = res.data.data || [];
  } catch (e) {}
};
const fetchReports = async () => {
  try {
    const res = await api.get("/admin/reports");
    reports.value = res.data.data || [];
  } catch (e) {}
};
const fetchLogs = async () => {
  try {
    const res = await api.get("/dev-logs");
    devLogs.value = res.data.data || [];
  } catch (e) {}
};

const toggleUserStatus = async (user) => {
  const newStatus = user.status === 1 ? 0 : 1;
  const action = newStatus === 0 ? "永久封禁" : "解封";
  try {
    await ElMessageBox.confirm(`确定要${action}该用户吗？`);
    await api.put(`/admin/users/${user.id}/status`, { status: newStatus });
    ElMessage.success("操作成功");
    fetchUsers();
  } catch (e) {}
};

const unfreezeUser = async (id) => {
  try {
    await api.put(`/admin/users/${id}/unfreeze`);
    ElMessage.success("已解除临时冻结");
  } catch (e) {
    ElMessage.error("操作失败");
  }
};

const deleteArticle = async (id) => {
  try {
    await ElMessageBox.confirm("确定强制下架该文章？");
    await api.delete(`/admin/articles/${id}`);
    ElMessage.success("已删除");
    fetchArticles();
  } catch (e) {}
};

const handleReport = async (report, deduct) => {
  try {
    await api.post("/admin/reports/handle", {
      reportId: report.id,
      commentId: report.comment_id,
      offenderId: report.offender_id,
      deductScore: deduct,
    });
    ElMessage.success("处理完成");
    fetchReports();
  } catch (e) {
    ElMessage.error("处理失败");
  }
};

const publishLog = async () => {
  if (!logForm.version || !logForm.content)
    return ElMessage.warning("请填写完整");
  try {
    await api.post("/admin/dev-logs", logForm);
    ElMessage.success("发布成功");
    logForm.content = "";
    logForm.version = "";
    fetchLogs();
  } catch (e) {
    ElMessage.error("发布失败");
  }
};

const deleteLog = async (id) => {
  try {
    await api.delete(`/admin/dev-logs/${id}`);
    ElMessage.success("已删除");
    fetchLogs();
  } catch (e) {}
};

onMounted(async () => {
  try {
    const userRes = await api.get("/user/info");
    if (userRes.data.code !== 200 || userRes.data.data.role !== "admin") {
      ElMessage.error("无权访问");
      router.push("/");
      return;
    }
    await fetchStats();
    fetchUsers();
    fetchArticles();
    fetchReports();
    fetchLogs();
  } catch (e) {
    ElMessage.error("加载失败或无权限");
    router.push("/");
  }
});
</script>

<style scoped>
/* 保持原有样式 */
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
  font-family: "Plus Jakarta Sans", sans-serif;
}
.sidebar {
  width: 240px;
  background: #001529;
  color: white;
  display: flex;
  flex-direction: column;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.menu {
  flex: 1;
  padding: 20px 0;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 25px;
  cursor: pointer;
  transition: 0.3s;
  color: rgba(255, 255, 255, 0.65);
}
.menu-item:hover,
.menu-item.active {
  background: #1890ff;
  color: white;
}
.logout {
  padding: 20px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.65);
  display: flex;
  align-items: center;
  gap: 10px;
}
.logout:hover {
  color: white;
}

.content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
h2 {
  margin: 0;
}
.user-info {
  background: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.stat-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.stat-card .label {
  color: #8c8c8c;
  margin-bottom: 10px;
}
.stat-card .num {
  font-size: 36px;
  font-weight: bold;
  color: #1890ff;
}

.charts-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.chart-box {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-width: 0;
}
.chart-box.wide {
  flex: 1.5;
}
.chart-box h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}
.chart {
  width: 100%;
  height: 350px;
}

.table-container {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.toolbar {
  margin-bottom: 20px;
}

.log-form {
  background: #f9fafb;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}
.form-row {
  display: flex;
  gap: 15px;
}

/* ✨✨✨ 修复后的上传组件样式 ✨✨✨ */
.upload-area {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* 1. 外层容器只负责定宽高 */
.avatar-uploader {
  width: 178px;
  height: 100px;
  display: block; /* 必须是 block */
}

/* 2. 核心修复：使用 :deep 穿透修改内部点击区域 */
.avatar-uploader :deep(.el-upload) {
  width: 100%;
  height: 100%;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);

  /* 让内部内容居中 */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
}

/* 3. 鼠标悬停变色 */
.avatar-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

/* 4. 图标样式 */
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  /* 图标会自动在 flex 容器中居中 */
}

/* 5. 图片预览样式 */
.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持比例填充 */
  display: block;
}

.form-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>