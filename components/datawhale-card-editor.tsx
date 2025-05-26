"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Download, Upload, Eye, Edit3, Share2, RefreshCw, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import html2canvas from "html2canvas"

// 标签颜色配置
const tagColors = [
  "from-blue-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-orange-500 to-red-600",
  "from-indigo-500 to-blue-600",
  "from-green-500 to-emerald-600",
  "from-purple-500 to-pink-600",
  "from-yellow-500 to-orange-600",
  "from-teal-500 to-cyan-600",
  "from-red-500 to-pink-600",
]

const DatawhaleCardEditor = () => {
  const { toast } = useToast()
  const [cardData, setCardData] = useState({
    name: "张小鲸",
    school: "北京理工大学 计算机科学与技术",
    hometown: "四川成都",
    motto: "代码如诗，算法如画，愿与志同道合的伙伴一起在AI的海洋中遨游！",
    partner: "机器学习项目合作伙伴，一起刷算法题的小伙伴",
    contribution: "分享深度学习实战经验，协助新人答疑解惑，贡献开源代码",
    connection: "通过组队学习入坑，已参与3个学习项目，深度受益于社区氛围",
    tags: ["Datawhale 社区成员", "DatawhaleAI试点小组负责人", "小程序负责人"],
    avatar:
      "dw.png",
  })

  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newTag, setNewTag] = useState("")
  const cardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setCardData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !cardData.tags.includes(newTag.trim())) {
      setCardData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setCardData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: "请选择小于5MB的图片文件",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setCardData((prev) => ({
          ...prev,
          avatar: e.target?.result as string,
        }))
        toast({
          title: "头像上传成功",
          description: "头像已更新",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const downloadCard = async () => {
    if (!cardRef.current) return

    setIsLoading(true)
    try {
      // 等待所有图片加载完成
      const images = cardRef.current.querySelectorAll("img")
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise((resolve) => {
            img.onload = resolve
            img.onerror = resolve
          })
        }),
      )

      // 等待字体加载
      await document.fonts.ready

      // 创建一个包含背景的容器来导出
      const exportContainer = document.createElement("div")
      exportContainer.style.background = "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)"
      exportContainer.style.padding = "40px"
      exportContainer.style.minHeight = "100vh"
      exportContainer.style.display = "flex"
      exportContainer.style.alignItems = "center"
      exportContainer.style.justifyContent = "center"
      exportContainer.style.position = "fixed"
      exportContainer.style.top = "0"
      exportContainer.style.left = "0"
      exportContainer.style.width = "100vw"
      exportContainer.style.height = "100vh"
      exportContainer.style.zIndex = "9999"

      // 克隆卡片元素
      const cardClone = cardRef.current.cloneNode(true) as HTMLElement
      cardClone.style.maxWidth = "800px"
      cardClone.style.width = "100%"
      cardClone.style.margin = "0 auto"

      exportContainer.appendChild(cardClone)
      document.body.appendChild(exportContainer)

      // 使用html2canvas生成图片
      const canvas = await html2canvas(exportContainer, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        imageTimeout: 15000,
        removeContainer: true,
        logging: false,
        width: exportContainer.offsetWidth,
        height: exportContainer.offsetHeight,
        scrollX: 0,
        scrollY: 0,
      })

      // 移除临时容器
      document.body.removeChild(exportContainer)

      // 创建下载链接
      const link = document.createElement("a")
      link.download = `datawhale-card-${cardData.name || "unnamed"}.png`
      link.href = canvas.toDataURL("image/png", 1.0)
      link.click()

      toast({
        title: "下载成功",
        description: "名片图片已保存到本地",
      })
    } catch (error) {
      console.error("下载失败:", error)
      toast({
        title: "下载失败",
        description: "请重试或检查浏览器权限",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const shareCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cardData.name}的Datawhale名片`,
          text: cardData.motto,
          url: window.location.href,
        })
      } catch (error) {
        console.log("分享取消")
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "链接已复制",
        description: "可以分享给朋友了",
      })
    }
  }

  const resetCard = () => {
    setCardData({
      name: "",
      school: "",
      hometown: "",
      motto: "",
      partner: "",
      contribution: "",
      connection: "",
      tags: [],
      avatar:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='100' cy='100' r='100' fill='url(%23grad1)'/%3E%3Cpath d='M60 120 Q80 100 100 120 Q120 140 140 120 Q160 100 180 120 Q160 140 140 160 Q120 180 100 160 Q80 180 60 160 Q40 140 60 120 Z' fill='white' opacity='0.9'/%3E%3Ccircle cx='130' cy='130' r='4' fill='white'/%3E%3Cpath d='M85 105 Q90 95 95 105' stroke='white' strokeWidth='3' fill='none'/%3E%3Cpath d='M75 95 Q80 85 85 95' stroke='white' strokeWidth='3' fill='none'/%3E%3C/svg%3E",
    })
    toast({
      title: "已重置",
      description: "名片信息已清空",
    })
  }

  const CardPreview = () => (
    <div
      ref={cardRef}
      id="card-preview"
      className="bg-white rounded-3xl p-9 shadow-2xl relative overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-3xl"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        minHeight: "600px",
      }}
    >
      {/* 顶部渐变条 */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-400 to-blue-400"></div>

      {/* 简化的背景效果 */}
      <div className="absolute -top-1/2 -right-1/2 w-full h-full opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
      </div>

      {/* 头部区域 - 修复居中问题 */}
      <div className="text-center mb-8 relative z-10">
        {/* 头像 */}
        <div className="w-24 h-24 mx-auto mb-4">
          <img
            src={cardData.avatar || "/placeholder.svg"}
            alt="头像"
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
            crossOrigin="anonymous"
          />
        </div>

        {/* 姓名 */}
        <h1 className="text-3xl font-bold text-blue-600 mb-4 leading-tight">{cardData.name || "请输入姓名"}</h1>

        {/* 标签区域 - 强制居中 */}
        <div className="flex flex-wrap justify-center gap-2" style={{ textAlign: "center" }}>
          {cardData.tags.map((tag, index) => {
            const colorIndex = index % tagColors.length
            const isDatawhaleTag = tag.includes("Datawhale") || tag.includes("社区成员")
            return (
              <div
                key={index}
                className={`inline-flex items-center gap-2 text-white px-4 py-2 rounded-full text-sm font-semibold`}
                style={{
                  background: `linear-gradient(to right, ${
                    colorIndex === 0
                      ? "#3b82f6, #8b5cf6"
                      : colorIndex === 1
                        ? "#10b981, #14b8a6"
                        : colorIndex === 2
                          ? "#ec4899, #f43f5e"
                          : colorIndex === 3
                            ? "#f97316, #ef4444"
                            : colorIndex === 4
                              ? "#6366f1, #3b82f6"
                              : colorIndex === 5
                                ? "#22c55e, #10b981"
                                : colorIndex === 6
                                  ? "#a855f7, #ec4899"
                                  : colorIndex === 7
                                    ? "#eab308, #f97316"
                                    : colorIndex === 8
                                      ? "#14b8a6, #06b6d4"
                                      : "#ef4444, #ec4899"
                  })`,
                }}
              >
                {isDatawhaleTag && <span>🐋</span>}
                {!isDatawhaleTag && <span>#</span>}
                {tag}
              </div>
            )
          })}
        </div>
      </div>

      {/* 座右铭区域 */}
      <div className="bg-gradient-to-r from-pink-400 to-red-400 text-white p-5 rounded-2xl mb-7 relative overflow-hidden">
        <div className="text-sm font-semibold opacity-90 mb-2 flex items-center gap-2 relative z-10">
          <span>✨</span>
          一句话让别人记住我
        </div>
        <div className="text-base font-semibold italic leading-relaxed relative z-10">
          "{cardData.motto || "请输入个人座右铭"}"
        </div>
      </div>

      {/* 信息网格 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 院校和老家 */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <InfoCard
            icon="🏫"
            label="院校"
            content={cardData.school || "请输入院校信息"}
            gradient="from-yellow-400 to-orange-400"
          />
          <InfoCard
            icon="🏠"
            label="老家"
            content={cardData.hometown || "请输入老家"}
            gradient="from-teal-400 to-cyan-400"
          />
        </div>

        <InfoCard
          icon="🤝"
          label="我想找的搭子"
          content={cardData.partner || "请描述你想找的合作伙伴"}
          gradient="from-blue-500 to-purple-600"
        />
        <InfoCard
          icon="💡"
          label="我可以为社区做什么"
          content={cardData.contribution || "请描述你能为社区做的贡献"}
          gradient="from-green-400 to-emerald-500"
        />
        <InfoCard
          icon="🌊"
          label="与Datawhale渊源"
          content={cardData.connection || "请描述与Datawhale的渊源"}
          gradient="from-indigo-500 to-blue-600"
          className="col-span-2"
        />
      </div>
    </div>
  )

  const InfoCard = ({
    icon,
    label,
    content,
    gradient,
    className = "",
  }: {
    icon: string
    label: string
    content: string
    gradient: string
    className?: string
  }) => (
    <div
      className={`bg-white border border-gray-200 p-5 rounded-2xl shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group ${className}`}
    >
      <div
        className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${gradient} transition-all group-hover:w-2`}
      ></div>
      <div className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
        <span>{icon}</span>
        {label}
      </div>
      <div className="text-sm text-gray-800 leading-relaxed font-medium">{content}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500">
      <div className="container mx-auto p-6">
        {/* 顶部工具栏 */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>🐋</span>
                  Datawhale 名片编辑器
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  {isPreviewMode ? <Edit3 size={18} /> : <Eye size={18} />}
                  {isPreviewMode ? "编辑" : "预览"}
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Upload size={18} />
                  上传头像
                </Button>
                <Button onClick={shareCard} variant="ghost" className="text-white hover:bg-white/20">
                  <Share2 size={18} />
                  分享
                </Button>
                <Button onClick={resetCard} variant="ghost" className="text-white hover:bg-white/20">
                  <RefreshCw size={18} />
                  重置
                </Button>
                <Button
                  onClick={downloadCard}
                  disabled={isLoading}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Download size={18} />
                  {isLoading ? "下载中..." : "下载卡片"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧编辑区域 */}
          {!isPreviewMode && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Edit3 size={20} />
                  编辑信息
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label className="text-white/90">姓名</Label>
                    <Input
                      value={cardData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder-white/60 focus:ring-white/50"
                      placeholder="请输入姓名"
                    />
                  </div>

                  <div>
                    <Label className="text-white/90">个人标签</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          className="bg-white/20 border-white/30 text-white placeholder-white/60 focus:ring-white/50"
                          placeholder="输入标签，如：Datawhale 社区成员"
                          onKeyPress={(e) => e.key === "Enter" && addTag()}
                        />
                        <Button onClick={addTag} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                          <Plus size={16} />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cardData.tags.map((tag, index) => {
                          const colorIndex = index % tagColors.length
                          return (
                            <div
                              key={index}
                              className={`inline-flex items-center gap-1 bg-gradient-to-r ${tagColors[colorIndex]} text-white px-3 py-1 rounded-full text-sm`}
                            >
                              <span>{tag.includes("Datawhale") || tag.includes("社区成员") ? "🐋" : "#"}</span>
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:bg-white/20 rounded-full p-1"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/90">院校</Label>
                    <Input
                      value={cardData.school}
                      onChange={(e) => handleInputChange("school", e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder-white/60 focus:ring-white/50"
                      placeholder="请输入院校信息"
                    />
                  </div>

                  <div>
                    <Label className="text-white/90">老家</Label>
                    <Input
                      value={cardData.hometown}
                      onChange={(e) => handleInputChange("hometown", e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder-white/60 focus:ring-white/50"
                      placeholder="请输入老家"
                    />
                  </div>

                  <div>
                    <Label className="text-white/90">一句话让别人记住我</Label>
                    <Textarea
                      value={cardData.motto}
                      onChange={(e) => handleInputChange("motto", e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder-white/60 focus:ring-white/50 resize-none"
                      rows={3}
                      placeholder="请输入个人座右铭"
                    />
                  </div>

                  <div>
                    <Label className="text-white/90">我想找的搭子</Label>
                    <Textarea
                      value={cardData.partner}
                      onChange={(e) => handleInputChange("partner", e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder-white/60 focus:ring-white/50 resize-none"
                      rows={2}
                      placeholder="请描述你想找的合作伙伴"
                    />
                  </div>

                  <div>
                    <Label className="text-white/90">我可以为社区做什么</Label>
                    <Textarea
                      value={cardData.contribution}
                      onChange={(e) => handleInputChange("contribution", e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder-white/60 focus:ring-white/50 resize-none"
                      rows={2}
                      placeholder="请描述你能为社区做的贡献"
                    />
                  </div>

                  <div>
                    <Label className="text-white/90">与Datawhale渊源</Label>
                    <Textarea
                      value={cardData.connection}
                      onChange={(e) => handleInputChange("connection", e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder-white/60 focus:ring-white/50 resize-none"
                      rows={2}
                      placeholder="请描述与Datawhale的渊源"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 右侧预览区域 */}
          <div className={`${isPreviewMode ? "col-span-1 lg:col-span-2 flex justify-center" : ""}`}>
            <div className={`${isPreviewMode ? "max-w-4xl w-full" : ""}`}>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Eye size={20} />
                预览效果
              </h2>
              <CardPreview />
            </div>
          </div>
        </div>

        {/* 隐藏的文件输入 */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
      </div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .bg-gradient-conic {
          background: conic-gradient(transparent, rgba(102, 126, 234, 0.1), transparent);
        }
      `}</style>
    </div>
  )
}

export default DatawhaleCardEditor
