// pages/detail/detail.js
// 文章详情页 - 展示文章完整内容，支持点赞功能

const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    articleId: '',      // 文章ID
    article: null,      // 文章数据
    loading: true,      // 加载状态
    liked: false,       // 是否已点赞
    isLoggedIn: false   // 登录状态
  },

  /**
   * 页面加载时获取文章ID
   * @param {Object} options - 页面参数，包含文章ID
   */
  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ articleId: id });
    }
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });
    
    // 已登录且有文章ID时加载详情
    if (isLoggedIn && this.data.articleId && !this.data.article) {
      this.loadArticleDetail(this.data.articleId);
    }
  },

  /**
   * 加载文章详情
   * @param {string} id - 文章ID
   */
  async loadArticleDetail(id) {
    this.setData({ loading: true });
    
    try {
      const res = await api.getArticleDetail(id);
      
      if (res.code === 200 && res.data) {
        // 处理文章数据，添加分类名称
        const article = {
          ...res.data,
          categoryName: util.getCategoryName(res.data.category)
        };
        
        this.setData({
          article,
          loading: false
        });
        
        // 动态设置页面标题
        wx.setNavigationBarTitle({
          title: article.title.length > 10 
            ? article.title.substring(0, 10) + '...' 
            : article.title
        });
      } else {
        // 文章不存在或加载失败
        this.setData({
          article: null,
          loading: false
        });
        wx.showToast({
          title: res.message || '文章加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[Detail] 加载文章详情失败:', error);
      this.setData({
        article: null,
        loading: false
      });
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 点赞/取消点赞文章
   */
  async onLike() {
    // 检查登录状态
    const app = getApp();
    if (!app.getLoginStatus()) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    
    const { articleId, liked } = this.data;
    
    try {
      if (liked) {
        // 取消点赞
        const res = await api.unlikeArticle(articleId);
        
        if (res.code === 200) {
          this.setData({
            liked: false,
            'article.likeCount': res.data.likeCount
          });
          
          wx.showToast({
            title: '已取消点赞',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: res.message || '取消失败',
            icon: 'none'
          });
        }
      } else {
        // 点赞
        const res = await api.likeArticle(articleId);
        
        if (res.code === 200) {
          this.setData({
            liked: true,
            'article.likeCount': res.data.likeCount
          });
          
          wx.showToast({
            title: '点赞成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.message || '点赞失败',
            icon: 'none'
          });
        }
      }
    } catch (error) {
      console.error('[Detail] 点赞操作失败:', error);
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 返回首页
   */
  goBack() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 跳转登录页
   */
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  /**
   * 分享文章
   */
  onShareAppMessage() {
    const { article } = this.data;
    if (!article) return {};
    
    return {
      title: article.title,
      path: `/pages/detail/detail?id=${article.id}`
    };
  }
});
