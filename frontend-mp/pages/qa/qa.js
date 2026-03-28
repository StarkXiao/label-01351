// pages/qa/qa.js
// 文化问答页面 - 查看问题、发布问题、回答问题

const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    isLoggedIn: false,
    questionList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    loadingMore: false,
    showPublishModal: false,
    publishForm: {
      title: '',
      content: ''
    },
    showAnswerModal: false,
    currentQuestionId: '',
    answerContent: '',
    canPublish: false,
    canAnswer: false,
    publishing: false,
    answering: false
  },

  onLoad() {
    this.loadQuestions();
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });
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

  async loadQuestions() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const res = await api.getQuestionList({
        page: this.data.page,
        pageSize: this.data.pageSize
      });

      if (res.code === 200) {
        const list = res.data.list.map(item => ({
          ...item,
          summary: util.truncateText(item.content, 80)
        }));

        this.setData({
          questionList: this.data.page === 1 ? list : [...this.data.questionList, ...list],
          hasMore: res.data.hasMore
        });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
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

  showPublishModal() {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    this.setData({
      showPublishModal: true,
      publishForm: { title: '', content: '' },
      canPublish: false
    });
  },

  hidePublishModal() {
    this.setData({
      showPublishModal: false,
      publishForm: { title: '', content: '' },
      canPublish: false
    });
  },

  onPublishTitleInput(e) {
    this.setData({ 'publishForm.title': e.detail.value });
    this.checkCanPublish();
  },

  onPublishContentInput(e) {
    this.setData({ 'publishForm.content': e.detail.value });
    this.checkCanPublish();
  },

  checkCanPublish() {
    const { title, content } = this.data.publishForm;
    const titleLen = title.trim().length;
    const contentLen = content.trim().length;
    const canPublish = titleLen >= 5 && contentLen >= 10;
    this.setData({ canPublish });
  },

  async publishQuestion() {
    if (this.data.publishing || !this.data.canPublish) return;

    const { title, content } = this.data.publishForm;

    if (title.trim().length < 5) {
      wx.showToast({ title: '问题标题至少5字', icon: 'none' });
      return;
    }

    if (content.trim().length < 10) {
      wx.showToast({ title: '问题描述至少10字', icon: 'none' });
      return;
    }

    this.setData({ publishing: true });
    wx.showLoading({ title: '发布中...' });

    try {
      const res = await api.publishQuestion({
        title: title.trim(),
        content: content.trim()
      });

      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({ title: '发布成功', icon: 'success' });
        this.hidePublishModal();
        this.refreshData();
      } else {
        wx.showToast({ title: res.message || '发布失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[QA] 发布问题失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ publishing: false });
    }
  },

  showAnswerModal(e) {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    const questionId = e.currentTarget.dataset.id;
    this.setData({
      showAnswerModal: true,
      currentQuestionId: questionId,
      answerContent: '',
      canAnswer: false
    });
  },

  hideAnswerModal() {
    this.setData({
      showAnswerModal: false,
      currentQuestionId: '',
      answerContent: '',
      canAnswer: false
    });
  },

  onAnswerContentInput(e) {
    this.setData({ answerContent: e.detail.value });
    this.checkCanAnswer();
  },

  checkCanAnswer() {
    const contentLen = this.data.answerContent.trim().length;
    const canAnswer = contentLen >= 5;
    this.setData({ canAnswer });
  },

  async submitAnswer() {
    if (this.data.answering || !this.data.canAnswer) return;

    const content = this.data.answerContent.trim();

    if (content.length < 5) {
      wx.showToast({ title: '回答至少5字', icon: 'none' });
      return;
    }

    this.setData({ answering: true });
    wx.showLoading({ title: '提交中...' });

    try {
      const res = await api.answerQuestion({
        questionId: this.data.currentQuestionId,
        content: content
      });

      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({ title: '回答成功', icon: 'success' });
        this.hideAnswerModal();
        this.refreshData();
      } else {
        wx.showToast({ title: res.message || '提交失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[QA] 提交回答失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ answering: false });
    }
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  }
});
