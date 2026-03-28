// pages/qa/qa.js
// 文化问答页面 - 展示问题列表，支持发布问题

const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    isLoggedIn: false,
    categories: [],
    currentCategory: 'all',
    questionList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    keyword: '',
    loading: false,
    loadingMore: false,
    showPublishForm: false,
    formData: {
      title: '',
      category: '',
      content: ''
    },
    canSubmit: false,
    submitting: false
  },

  onLoad() {
    this.loadCategories();
    this.loadQuestions();
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });
    
    this.loadCategories();
    if (isLoggedIn) {
      this.checkCanSubmit();
    }
    
    this.refreshData();
  },

  onPullDownRefresh() {
    this.refreshData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  async refreshData() {
    this.setData({
      page: 1,
      questionList: [],
      hasMore: true
    });
    await this.loadQuestions();
  },

  async loadCategories() {
    try {
      const res = await api.getCategoryList();
      if (res.code === 200) {
        this.setData({ categories: res.data });
      }
    } catch (error) {
      console.error('[QA] 加载分类失败:', error);
    }
  },

  async loadQuestions() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const res = await api.getQuestionList({
        category: this.data.currentCategory,
        page: this.data.page,
        pageSize: this.data.pageSize,
        keyword: this.data.keyword
      });
      
      if (res.code === 200) {
        const list = res.data.list.map(item => ({
          ...item,
          categoryName: util.getCategoryName(item.category),
          summary: util.truncateText(item.content, 80)
        }));
        
        this.setData({
          questionList: this.data.page === 1 ? list : [...this.data.questionList, ...list],
          hasMore: res.data.hasMore
        });
      }
    } catch (error) {
      console.error('[QA] 加载问题失败:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadMore() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    
    this.setData({
      loadingMore: true,
      page: this.data.page + 1
    });
    
    await this.loadQuestions();
    this.setData({ loadingMore: false });
  },

  onCategoryChange(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.currentCategory) return;
    
    this.setData({
      currentCategory: id,
      page: 1,
      questionList: [],
      hasMore: true
    }, () => {
      this.loadQuestions();
    });
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.setData({
      page: 1,
      questionList: [],
      hasMore: true
    });
    this.loadQuestions();
  },

  clearSearch() {
    this.setData({
      keyword: '',
      page: 1,
      questionList: [],
      hasMore: true
    });
    this.loadQuestions();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/qa-detail/qa-detail?id=${id}`
    });
  },

  showPublishModal() {
    const app = getApp();
    if (!app.checkLogin()) return;
    
    this.setData({ 
      showPublishForm: true,
      formData: {
        title: '',
        category: '',
        content: ''
      },
      canSubmit: false
    });
  },

  hidePublishModal() {
    this.setData({ showPublishForm: false });
  },

  onTitleInput(e) {
    this.setData({ 'formData.title': e.detail.value });
    this.checkCanSubmit();
  },

  onCategorySelect(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ 'formData.category': id });
    this.checkCanSubmit();
  },

  onContentInput(e) {
    this.setData({ 'formData.content': e.detail.value });
    this.checkCanSubmit();
  },

  checkCanSubmit() {
    const { title, category, content } = this.data.formData;
    const titleLen = title.trim().length;
    const contentLen = content.trim().length;
    const canSubmit = titleLen >= 2 && category !== '' && contentLen >= 5;
    
    this.setData({ canSubmit });
  },

  async onSubmit() {
    if (this.data.submitting) return;
    
    const { title, category, content } = this.data.formData;
    
    if (!title || title.trim().length < 2) {
      wx.showToast({ title: '请输入问题标题（至少2字）', icon: 'none' });
      return;
    }
    
    if (!category) {
      wx.showToast({ title: '请选择分类', icon: 'none' });
      return;
    }
    
    if (!content || content.trim().length < 5) {
      wx.showToast({ title: '请输入问题描述（至少5字）', icon: 'none' });
      return;
    }
    
    this.setData({ submitting: true });
    wx.showLoading({ title: '发布中...' });
    
    try {
      const res = await api.publishQuestion({
        title: title.trim(),
        category,
        content: content.trim()
      });
      
      wx.hideLoading();
      
      if (res.code === 200) {
        wx.showToast({ title: '发布成功', icon: 'success' });
        this.setData({ 
          showPublishForm: false,
          formData: {
            title: '',
            category: '',
            content: ''
          },
          canSubmit: false
        });
        this.refreshData();
      } else {
        wx.showToast({ title: res.message || '发布失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[QA] 发布问题失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  }
});
