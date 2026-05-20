Component({
  properties: {
    message: {
      type: Object,
      value: {},
    },
  },

  data: {
    timeStr: "",
  },

  lifetimes: {
    attached() {
      this.formatTime();
    },
  },

  observers: {
    message() {
      this.formatTime();
    },
  },

  methods: {
    formatTime() {
      const msg = this.data.message;
      if (!msg || !msg.time) return;
      const d = new Date(msg.time);
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      this.setData({ timeStr: `${h}:${m}` });
    },

    onTapBubble() {
      this.triggerEvent("tapbubble", { message: this.data.message });
    },

    onTapQuickReply(e) {
      const reply = e.currentTarget.dataset.reply;
      this.triggerEvent("quickreply", { reply });
    },
  },
});
