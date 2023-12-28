# Facebook

## 应用

### 创建应用

- [注册并登录Meta开发者](https://developers.facebook.com/apps)

- 没有公司认证的开发者，最多可以拥有15个应用的开发者或管理员身份（指的是已归档的应用）

- 请前往[应用](https://developers.facebook.com/apps) 窗口，然后点击**创建应用**

- 选择用例

  - 允许用户用自己的 Facebook 帐户登录 ---- 用于实现第三方登录
  - 获得游戏登录方式并向玩家获取数据
  - 其他 --- 表示除了 Facebook 登录，您还想实现广告、游戏或消息这些产品，会让你选择具体的应用类型，而不再是用例

  > 应用类型决定应用可以使用的产品和 API
  >
  > 探索阶段可以选择无

- 设置应用名称和邮箱

  - Meta商务管理平台账户没有就空着 ---- 和广告相关才会用到

### 应用类型

#### 消费者

- 适用于集成 Facebook登录等消费者相关产品以便为应用用户提供更加个性化体验的应用
- [可用产品](#产品相关) --- 应用事件、应用链接、Audience Network、Facebook 登录、Facebook Pixel 像素代码、Fundraiser、Instagram Basic Display、分享、社交插件、Webhooks
- 可用权限
  - email：读取用户的首选邮箱
  - instagram_graph_user_media：读取媒体节点（代表图片、视频或相册）及其连线。
  - instagram_graph_user_profile：读取应用Instagram 用户的主页信息。
  - public_profile：（公开资料）权限允许应用读取 [User](https://developers.facebook.com/docs/graph-api/reference/user/)（用户）节点的 [Default Public Profile Fields](https://developers.facebook.com/docs/graph-api/reference/user/#default-public-profile-fields)（默认的公开资料字段）。系统将自动授予所有应用此权限。
  - user_age_range：访问用户 Facebook 个人主页中所列的年龄范围信息。
  - user_birthday：读取用户 Facebook 个人主页中显示的生日
  - user_messenger_contact：页面上通过Messenger私信
  - user_friends：获取应用用户的好友名单
  - user_gender：Facebook 个人主页中显示的性别信息
  - user_hometown： Facebook 个人主页中显示的家乡信息
  - user_likes：读取用户赞过的所有 Facebook 公共主页的列表
  - user_link：用户的 Facebook 个人主页网址信息
  - user_location：个人主页中“所在地”一栏显示的城市名称
  - user_photos：读取用户上传到 Facebook 的照片
  - user_posts：访问用户在其时间线上发布的帖子
  - user_videos：读取用户上传的视频列表

#### 商务（公司）

- 适用于可帮助公司和组织管理**公共主页**、**小组**、**活动**、**广告**以及和**广告相关素材**的应用
- [可用产品](#产品相关) ---- 应用广告、应用事件、应用链接、Audience Network、Facebook 登录、Facebook Pixel 像素代码、小组 API、Instagram 图谱 API（不包括 Instagram Basic Display API）、即阅文、招聘求职、公共主页 API、市场营销 API、Messenger、分享、ThreatExchange、网络支付、Webhooks
- 可用功能
  - [广告管理标准访问级别](https://developers.facebook.com/docs/marketing-api/access#standard)
  - [业务资产用户个人主页访问权限](https://developers.facebook.com/docs/apps/features-reference#business-asset-user-profile-access)
  - [小组 API](https://developers.facebook.com/docs/apps/review/feature#reference-GROUPS_ACCESS)
  - [Instagram 公开内容访问权限](https://developers.facebook.com/docs/apps/review/feature#reference-INSTAGRAM_PUBLIC_CONTENT_ACCESS)
  - [直播视频 API](https://developers.facebook.com/docs/apps/review/feature#reference-LIVE_VIDEOS)
  - [公共主页提及](https://developers.facebook.com/docs/apps/review/feature#reference-MENTIONING)
  - [公共主页公开内容访问权限](https://developers.facebook.com/docs/apps/review/feature#reference-PAGES_ACCESS)
  - [公共主页公开元数据访问权限](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access)
- 可用权限
  - ads_management：读取和管理两类广告帐户：自己拥有的广告帐户，或其他广告帐户所有者授予了访问权限的广告帐户，依赖pages_read_engagement、pages_show_list
  - ads_read：访问广告成效分析 API，以拉取两类广告帐户的广告报告信息
  - attribution_read：访问广告归因分析 API，以拉取两类业务线的归因报告数据
  - business_management：允许您的应用使用商务管理平台 API 执行读取和写入操作
  - catalog_management：创建、读取、更新和删除用户拥有管理员身份的商务管理平台中的商品目录
  - groups_access_member_info：读取公开的小组成员信息，例如姓名和编号，但前提是帖子作者向您的应用授予了访问权限
  - email：读取用户的首选邮箱
  - instagram_basic：读取 Instagram 主页的信息和媒体内容，依赖pages_read_engagement、pages_show_list
  - instagram_manage_comments：访问与公共主页绑定的 Instagram 帐户创建、删除和隐藏评论。您的应用还能读取和回复照片中标记了或 @ 提及了商家的公开媒体内容和评论
  - instagram_manage_insights：访问与 Facebook 公共主页绑定的 Instagram 帐户的成效分析。您的应用还可以发现和读取其他业务主页的信息和媒体内容。
  - leads_retrieval：检索和读取线索广告表单（这些表单与使用广告管理工具或市场营销 API 创建的广告相关联）收集的所有信息，依赖 pages_manage_ads、pages_read_engagement、pages_show_list
  - pages_manage_ads：管理与公共主页相关的广告，依赖 pages_show_list
  - pages_manage_cta：管理 Facebook 公共主页行动号召按钮的端点执行 POST 和 DELETE 函数
  - pages_manage_engagement：创建、编辑和删除发布到公共主页上的评论。依赖 pages_read_user_content、pages_show_list
  - pages_manage_instant_articles：允许您的应用代表应用用户所管理的 Facebook 公共主页管理即阅文。
  - pages_manage_metadata：订阅和接收有关公共主页动态的 Webhook，以及更新公共主页的设置信息，依赖pages_show_list
  - pages_manage_posts：创建、编辑和删除您的公共主页帖子。依赖 pages_read_engagement、pages_show_list
  - pages_messaging：管理和访问公共主页的 Messenger 对话。依赖 pages_manage_metadata
  - pages_read_engagement：读取共主页发布的内容（帖子、照片、视频、活动）、粉丝数据（包括粉丝的姓名、公共主页范围编号）和头像，以及有关公共主页的元数据和其他成效分析。
  - pages_read_user_content：读取公共主页中的用户生成内容（例如用户或其他公共主页发布的帖子、评论和评分），以及删除公共主页帖子中的用户评论，依赖 pages_show_list
  - pages_show_list：访问用户管理的公共主页列表
  - pages_user_gender：与之关联的公共主页访问用户的性别信息。
  - pages_user_locale：与之关联的公共主页访问用户的语言/区域设置。
  - pages_user_timezone：与之关联的公共主页访问用户的时区信息。
  - public_profile：（公开资料）
  - publish_to_groups：代表用户在小组内发布内容，前提是该用户已向您的应用授予了访问权限。
  - publish_video：将直播视频发布到应用用户的时间线、小组、活动或公共主页。
  - read_insights：读取用户拥有的公共主页、应用和网域的成效分析数据
  - user_messenger_contact：页面上通过Messenger私信
  - whatsapp_business_management：读取或管理您拥有的或由其他企业通过此权限授予您相应权限的 WhatsApp 业务资产。这些业务资产包括：WhatsApp 商业帐号、手机号、消息模板、二维码及其关联消息，以及 Webhook 订阅。
  - whatsapp_business_messaging：向特定电话号码发送 WhatsApp 消息、上传和检索消息中的媒体、管理和获取 WhatsApp 商业简介信息以及使用 Meta 注册这些电话号码。

#### 小游戏

适用于可以在 Facebook 开放平台上玩的游戏应用

- 可用产品 --- 应用中心、Audience Network、小游戏、Messenger、Webhooks
- 可用权限
  - email：读取用户的首选邮箱
  - public_profile：（公开资料）
  - pages_messaging：管理和访问公共主页的 Messenger 对话。依赖 pages_manage_metadata
  - pages_user_gender：与之关联的公共主页访问用户的性别信息。
  - pages_user_locale：与之关联的公共主页访问用户的语言/区域设置。
  - pages_user_timezone：与之关联的公共主页访问用户的时区信息。

#### 游戏服务

适用于在 Facebook 开放平台之外玩的游戏应用

- 可用产品 --- 应用中心、Audience Network、Facebook 登录
- 可用权限
  - email：读取用户的首选邮箱
  - public_profile：（公开资料）
  - user_friends：获取应用用户的好友名单

#### Workplace

适用于可由 Workplace 客户安装的 SaaS 应用

#### 无

应用如指定为**无**类型，则表示不符合任何应用类型。指定为“无”类型的应用包含“消费者”和“公司”应用类型可用的部分（但非全部）权限和产品组合。

### 应用身份

| 权限                       | 管理员 | 开发者 | 测试者 | 应用分析用户 |
| -------------------------- | ------ | ------ | ------ | ------------ |
| 修改应用设置               | ✔      | ✔      |        |              |
| 重置应用密钥               | ✔      |        |        |              |
| 移除应用                   | ✔      |        |        |              |
| 修改应用身份               | ✔      |        |        |              |
| 测试登录权限、功能和产品   | ✔      | ✔      | ✔      | ✔            |
| 创建测试版应用、用户和主页 | ✔      | ✔      |        |              |
| 查看应用成效分析           | ✔      | ✔      |        | ✔            |

### 测试版应用

这样用于已经上线的应用增加或修改功能时，不影响原应用的正常使用，为此克隆出来的子应用

测试应用沿用父应用的管理员和测试者

创建流程

1. 在应用面板中加载您想要克隆的应用。
2. 在面板左上角，点击应用选择下拉菜单，然后点击**创建测试版应用**。
3. 命名该应用并点击**创建测试版应用**。

### 测试公共主页

[官方说明](https://developers.facebook.com/docs/development/build-and-test/test-pages)

用于开发中模拟真实的 Facebook 公共主页

- 测试公共主页不受我们垃圾信息和虚假帐户检测系统的影响，因此，当您使用测试公共主页测试自己的应用时，这些主页不会遭到停用
- 测试公共主页只能由测试用户创建
- 测试公共主页无法与真实的 Facebook 用户互动，任何数据只向应用中有身份的用户显示
- 测试用户必须是创建测试公共主页的测试用户的好友，才能与该主页互动。

**创建测试公共主页**

如要创建测试公共主页，请登录您应用的测试用户帐户，然后照常创建 Facebook 公共主页。

要以测试用户的身份登录，请执行以下操作：

1. 前往应用窗口，然后选择您的应用，以在应用面板上加载。
2. 前往**身份** > **测试用户**，然后点击现有测试用户的**编辑**按钮。
3. 点击**以此测试用户的身份登录**，然后完成确认流程。

### 产品相关

- [应用广告](https://developers.facebook.com/docs/app-ads/)：用来在 Facebook、Messenger、Instagram 和 Audience Network 上推广应用
- [应用事件](https://developers.facebook.com/docs/app-events/)：应用或网页追踪事件，例如用户安装应用或完成购买
- [应用链接](https://developers.facebook.com/docs/applinks/)：深度链接到应用程序，在客户端点击时不会以Web视图加载，而是直接在APP中加载
- [Audience Network](https://developers.facebook.com/docs/audience-network/)：Facebook推出的一种广告平台，允许广告主在Facebook以外的应用程序和网站上投放广告。利用应用竞价，发行商可针对其广告库存开展公平的开放式竞拍
- [Facebook 登录](https://developers.facebook.com/docs/facebook-login/)：第三方登录
- [Facebook Pixel 像素代码](https://developers.facebook.com/docs/facebook-pixel/)：是一段 JavaScript 代码，可在自己的网站上追踪访客活动
- [小组 API](https://developers.facebook.com/docs/groups-api)：访问并管理小组内容（例如帖子、照片和视频）
- [Fundraiser ](https://developers.facebook.com/docs/fundraiser-api/)：将 Facebook 外的筹款活动连接到 Facebook，让参与者轻松联系 Facebook 好友，从而帮助他们更快地实现筹款目标。
- [Instagram Basic Display](https://developers.facebook.com/docs/instagram-basic-display-api)：获取其 Instagram 帐户中的基本个人信息、照片和视频
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)：获取、发布、管理、回复评论等
- [分享](https://developers.facebook.com/docs/sharing)：通过应用向Facebook发帖，类似分享到朋友圈
- [社交插件](https://developers.facebook.com/docs/plugins/)：赞按钮、分享按钮、评论插件、小组插件、公共主页插件、嵌入式帖子、嵌入式视频和直播
- [Webhooks](https://developers.facebook.com/docs/graph-api/webhooks)：用于接收对象变更的实时HTTP通知，无须查询来了解对象是否已发生变更，同时帮助您避免达到流量限制
- [公共主页 API](https://developers.facebook.com/docs/pages/)：访问和更新 Facebook 公共主页的设置及内容、创建和获取帖子、获取对公共主页自有内容的评论、获取公共主页成效分析、更新用户能够在公共主页上执行的操作等
- [市场营销 API](https://developers.facebook.com/docs/marketing-apis/)：在 Facebook、Instagram、Messenger 和 WhatsApp 上投放广告，自动化广告管理等
- [Messenger](https://developers.facebook.com/docs/messenger-platform/)：构建消息解决方案，以便与客户、潜在客户和粉丝互动
- [ThreatExchange](https://developers.facebook.com/programs/threatexchange/)：安全相关
- [网络支付](https://developers.facebook.com/docs/games_payments/)
- [小游戏](https://developers.facebook.com/docs/games/instant-games)：可以直接在动态或 Messenger 对话中查找并畅玩游戏，桌面和移动设备均适用
- [应用中心](https://developers.facebook.com/docs/games/listing/)：
- [招聘求职](https://developers.facebook.com/docs/pages/jobs-xml/)
- [即阅文](https://developers.facebook.com/docs/instant-articles/)：

### 功能相关

[官方文档](https://developers.facebook.com/docs/features-reference)

#### Page Mentioning

公共主页提及“即@”，也就是评论、回复

**用途**

- 允许用户使用您的应用发布提及其他公共主页的公共主页帖子。
- 提及与您的公共主页帖子内容相关的公共主页。

**端与边**

- [/page/feed](https://developers.facebook.com/docs/graph-api/reference/page/feed)
- [/page-post](https://developers.facebook.com/docs/graph-api/reference/page-post)
- [/page-post/comments](https://developers.facebook.com/docs/graph-api/reference/object/comments)

**权限**

- 需要应用审核
-  必须有`pages_read_engagement` 和 `pages_manage_posts` 权限
- 如果您的应用有专属的用户身份验证系统，请在审核说明中添加有效的帐号和密码，以便我们的团队轻松重现您的公共主页提及功能

#### Page Public Content Access

公共主页公开内容访问权限

**用途**

- 提供竞争基准分析
- 允许您的应用访问公共主页搜索 API，以及读取缺少 pages_read_engagement 权限和 pages_read_user_content 权限的公共主页公开数据。
- 可读数据包括企业元数据、公开评论和帖子。该功能的允许用途是为竞争分析和基准比较提供匿名综合的公开内容。 

**端与边**

- [/page/feed](https://developers.facebook.com/docs/graph-api/reference/page/feed)
- [/page-post](https://developers.facebook.com/docs/graph-api/reference/page-post)
- [/page-post/comments](https://developers.facebook.com/docs/graph-api/reference/object/comments)

**权限**

- 需要通过公司验证、应用审核
- 测试应用期间，提交应用供审核之前，应用只能访问在公共主页有身份的公共主页内容。如果希望应用能够访问其他公共主页的公开内容，您必须提交此功能供审核，以获取高级访问级别。

#### Page Public Metadata Access

公共主页公开元数据，**已被 Page Public Content Access -- [公共主页公开内容访问权限](#Page Public Content Access)取代**

**用途**

- 查看赞和粉丝数来分析与公共主页的互动率
- 多个离散的网页汇总面向公众的**简介**公共主页信息

**端与边**

- [/page](https://developers.facebook.com/docs/graph-api/reference/page)

**权限**

- 需要通过公司验证、应用审核
- 如果您的应用还需要读取公共主页动态连线或公共主页帖子的评论，请改为请求[公共主页公开内容访问权限](#Page Public Content Access)。

### 权限相关

权限和访问级别有关，和应用类型有关，

#### 访问级别

- 标准访问级别 --- 应用内部用户才能访问相应权限
  - 业务、消费者、游戏这三类应用（详见[应用类型](https://developers.facebook.com/docs/development/create-an-app/app-dashboard/app-types#consumer)），自动获取标准访问级别的功能
- 高级访问级别 --- 所有使用应用的用户都可以访问相应的权限
  - 现在所有的高级访问级别都需要[公司验证](https://developers.facebook.com/docs/development/release/business-verification)、[应用审核](#应用审核与权限申请)
  - 相反，没有获得高级访问级别的，只能给有应用身份的用户使用
  - 消费者应用会自动获取`email`和`public_profile`高级访问级别权限，但两项权限默认设置为标准访问级别，您必须将其手动切换为高级访问级别

[官方说明](https://developers.facebook.com/docs/permissions)

#### 应用审核与权限申请

[官方说明](https://developers.facebook.com/docs/app-review)

- 这一步是应用准备上线之前做的，应用审核的时候需要添加所用到的权限
- 每个权限的申请都有有详细的说明、url或应用包、使用视频
- 没用到的权限申请会带来麻烦
- 如果您请求获得权限的高级访问级别，则无论是哪项权限，请使用该权限发出至少 1 次成功的 API 调用。必须在提交应用审核后的 30 天内调用，并且可以用您的应用或[图谱 API 探索工具](https://developers.facebook.com/tools/explorer/)工具调用。
- 确保我们可以访问您的应用或网站。您的应用必须公开发布，或者您必须提供应用访问方式的相关说明。
- 完成应用开发后方可提交应用审核，然后您的应用才可供最终用户使用。如果您的应用尚未完成开发，或者您仍将对其做出更改，您的提交内容将无法通过审核
- 您仅可以请求应用当前需要的权限和功能。如果您打算在之后发布新版应用，而该版本需要新的权限和功能，则请切勿将其包含在当前的提交内容中

### 流量控制

[流量限制](https://developers.facebook.com/docs/graph-api/overview/rate-limiting)

### 版本管理

[版本管理](https://developers.facebook.com/docs/graph-api/guides/versioning)

## 访问口令

[官网说明](https://developers.facebook.com/docs/facebook-login/guides/access-tokens)

### 用户访问口令

- 短期token：有效期通常为一至两个小时；长期token：有效期通常为 60 天左右
- 但是用可能发生变化
- 通过网页登录生成的是短期token，可以使用应用密钥执行服务器端 API 调用，将它们转换为长期口令
- 使用 Facebook iOS 和 Android SDK 的移动应用默认获得长期口令。
- 通过长期口令享有 Facebook 市场营销 API [标准访问级别](https://developers.facebook.com/docs/marketing-api/access)的应用将收到没有过期时间的长期口令。[这些口令仍然可能因为其他原因失效](#口令)，但不会仅因时间因素而过期。[商务管理平台中的系统用户](https://developers.facebook.com/docs/marketing-api/businessmanager/systemuser)访问口令也是如此

- 口令时可移植的：获取到的token可在任何机器上使用，网页客户端执行身份验证，并通过服务器将短期口令交换为长期口令。此口令被送回网页客户端，然后网页客户端使用该口令进行 API 调用。
- Facebook 会更改存储于其中的内容及其编码方式，所以所有类型的访问口令长度日后均可能变化。访问口令的长度日后可能会增长或减少。请使用可变的长度数据类型，而不要指定存储访问口令的最大长度。

**JavaScript获取**

- [Javascript 版 Facebook SDK](https://developers.facebook.com/docs/javascript) 自动获取用户访问口令，并将它们保留在浏览器 Cookie 中。

- 调用 [`FB.getAuthResponse`](https://developers.facebook.com/docs/reference/javascript/FB.getAuthResponse/)，返回的响应中将包含 `accessToken` 属性。
-  [Facebook 网页 SDK 文档](https://developers.facebook.com/docs/web)，获取[完整代码示例](https://developers.facebook.com/docs/reference/php/examples#get-a-user-access-token)。
- 不使用SDK，[手动构建网页应用](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow) 

```js
FB.getLoginStatus(function(response) {
  if (response.status === 'connected') {
    var accessToken = response.authResponse.accessToken;
  } 
} );
```

### 应用访问口令

- 用于修改应用参数、创建和管理模拟用户，或者读取应用的成效分析。

- 大部分的用户数据对应用访问口令是可见的，但是，如果要读取用户数据并在应用中使用该数据，则应该使用用户访问口令，而不是应用访问口令。

生成token

```shell
curl -X GET "https://graph.facebook.com/oauth/access_token
  ?client_id={your-app-id}
  &client_secret={your-app-secret}
  &grant_type=client_credentials"
```

使用app_id和密钥直接请求

```shell
curl -i -X GET "https://graph.facebook.com/{api-endpoint}&access_token={your-app_id}|{your-app_secret}"   
```

### 公共主页访问口令

- 公共主页管理员必须向您的**应用授予**公共主页权限或所需的其他权限

示例：获取公共主页列表信息：name、id、tasks、category、category_list、**access_token** ---- 获取到了公共主页的访问口令

```sh
curl -i -X GET "https://graph.facebook.com/{your-user-id}/accounts?access_token={user-access-token}
```

结果

```json
{
  "data": [
    {
      "access_token": "EAACEdE...",
      "category": "Brand",
      "category_list": [
        {
          "id": "1605186416478696",
          "name": "Brand"
        }
      ],
      "name": "Ash Cat Page",
      "id": "1353269864728879",
      "tasks": [
        "ANALYZE",
        "ADVERTISE",
        "MODERATE",
        "CREATE_CONTENT",
        "MANAGE"
      ]
    },
    {
      "access_token": "EAACEdE...",
      "category": "Pet Groomer",
      "category_list": [
        {
          "id": "163003840417682",
          "name": "Pet Groomer"
        },
        {
          "id": "2632",
          "name": "Pet"
        }
      ],
      "name": "Unofficial: Tigger the Cat",
      "id": "1755847768034402",
      "tasks": [
        "ANALYZE",
        "ADVERTISE",
        "MODERATE",
        "CREATE_CONTENT"
      ]
    }
  ]
}
```

### 获取长期Token

查询 `GET oauth/access_token` 端点。

```sh
curl -i -X GET "https://graph.facebook.com/{graph-api-version}/oauth/access_token?  
    grant_type=fb_exchange_token&          
    client_id={app-id}&
    client_secret={app-secret}&
    fb_exchange_token={your-access-token}" 
```

响应示例

```json
{
  "access_token":"{long-lived-user-access-token}",
  "token_type": "bearer",
  "expires_in": 5183944            //The number of seconds until the token expires
}
```

> **注意**
>
> - 不得使用过期口令请求长期口令：口令过期后，应用必须引导用户再次登录，才能生成新的短期访问口令
> - 必须通过服务端调用：包含密钥，决不能通过客户端发送请求
> - 不得在多个客户端（多个电脑登录）使用同一个长期口令
> - 短期换短期，长期换长期：长期公共主页访问口令没有过期时间，仅在某些情况下失效

### 快速获取测试token

**方式一：[访问口令工具](https://developers.facebook.com/tools/accesstoken)**

**方式二：[Graph 调试工具获取](https://developers.facebook.com/tools/explorer/)**

- 我的应用 ---- 测试 ---- 图谱API探索工具

<img src="http://minio.botuer.com/study-node/imgs\获取token\image-20231016185847176.png" alt="image-20231016185847176" style="zoom:20%;" />





- 生成 access token

<img src="http://minio.botuer.com/study-node/imgs/16-获取token/image-20231016190127935.png" alt="image-20231016190127935" style="zoom:25%;" />



- 跳转

<img src="http://minio.botuer.com/study-node/imgs/16-获取token/image-20231016190236727.png" alt="image-20231016190236727" style="zoom:25%;" />

- 以 Xxxx 的身份继续

### 其他口令

[见官方文档](https://developers.facebook.com/docs/facebook-login/guides/access-tokens)



## Graph API

[官网说明](https://developers.facebook.com/docs/graph-api/overview)

#### 节点（Root Nodes）

-  Facebook 有很多节点，如：用户、页面、小组、帖子、照片和评论等
- 每个节点都有很多对象，每个对象用一个唯一编号表示，如：user_id、page_id 等
- [ACCESS-TOKEN](#访问口令) 分很多种：用户访问口令、公共主页访问口令、系统用户访问口令、应用访问口令、客户端访问口令

**用户节点**调用示例

```shell
curl -i -X GET \
  "https://graph.facebook.com/USER-ID?access_token=ACCESS-TOKEN"
```

返回结果：

```json
{
  "name": "Your Name",
  "id": "YOUR-USER-ID"
}
```

#### 节点元数据

用户获取节点对象的字段清单，包括字段名称、说明和数据类型，请求参数需要添加`metadata=1`

用户节点调用示例

```shell
curl -i -X GET \
  "https://graph.facebook.com/USER-ID?
    metadata=1&access_token=ACCESS-TOKEN"
```

响应结果包含 `metadata` 属性，可列出指定节点的所有受支持字段：

```js
{
  "name": "Jane Smith",
  "metadata": {
    "fields": [
      {
        "name": "id",
        "description": "The app user's App-Scoped User ID. This ID is unique to the app and cannot be used by other apps.",
        "type": "numeric string"
      },
      {
        "name": "age_range",
        "description": "The age segment for this person expressed as a minimum and maximum age. For example, more than 18, less than 21.",
        "type": "agerange"
      },
      {
        "name": "birthday",
        "description": "The person's birthday.  This is a fixed format string, like `MM/DD/YYYY`.  However, people can control who can see the year they were born separately from the month and day so this string can be only the year (YYYY) or the month + day (MM/DD)",
        "type": "string"
      },
...
```

#### /me

一个特殊端点，根据访问口令，转换为用户节点或页面节点

当使用用户访问口令时：

```shell
curl -i -X GET \
  "https://graph.facebook.com/me?access_token=ACCESS-TOKEN"
```

结果

```json
{
    "name": "Yuanhao Li",
    "id": "122101238366080604"
}
```

当使用页面访问口令时：

```json
{
    "name": "Play play",
    "id": "130149093522807"
}
```

#### 边（Root Edges）

两个节点之间的连接，如：用户与照片相连，照片节点可与评论相连

以下 cURL 示例将返回用户已发布到 Facebook 中的照片的列表。

```shell
curl -i -X GET \
  "https://graph.facebook.com/USER-ID/photos?access_token=ACCESS-TOKEN"
```

返回的每个编号都可以反映出照片节点及其上传到 Facebook 的时间。

```json
    {
  "data": [
    {
      "created_time": "2017-06-06T18:04:10+0000",
      "id": "1353272134728652"
    },
    {
      "created_time": "2017-06-06T18:01:13+0000",
      "id": "1353269908062208"
    }
  ],
}
```

#### 字段

- 查询节点或连线时，默认情况下会返回一系列字段
- 可用 `fields` 参数并列出想要返回的每个字段，从而指定想要返回的字段
- 但是对象编号是一定会返回的
- 复杂参数
  - list 类参数用 JSON 语法指定，例如 `["firstitem", "seconditem", "thirditem"]`
  - object 类参数也用 JSON 语法指定，例如 `{"firstkey": "firstvalue", "secondKey": 123}`



以下 cURL 请求中有 `fields` 参数和用户的姓名、电子邮件地址和头像。

```shell
curl -i -X GET \
  "https://graph.facebook.com/USER-ID?fields=id,name,email,picture&access_token=ACCESS-TOKEN"
```

返回的数据

```json
{
  "id": "USER-ID",
  "name": "EXAMPLE NAME",
  "email": "EXAMPLE@EMAIL.COM",
  "picture": {
    "data": {
      "height": 50,
      "is_silhouette": false,
      "url": "URL-FOR-USER-PROFILE-PICTURE",
      "width": 50
    }
  }
}
```

#### 更新

 `POST` 操作更新字段。例如，可按如下方式更新 `email` 字段：

```shell
curl -i -X POST \
  "https://graph.facebook.com/USER-ID?email=YOURNEW@EMAILADDRESS.COM&access_token=ACCESS-TOKEN"
```

**先写后读**

- 创建或更新后，立即读取成功发布或更新的对象，并返回。

- 默认情况下，将返回对象编号。
- 更多信息，需要 `fields` 参数并列出要返回的字段。

例如，要向页面动态中发布消息“Hello”，您可以发出以下请求：

```sh
curl -i - X POST "https://graph.facebook.com/PAGE-ID/feed?message=Hello&fields=created_time,from,id,message&access_token=ACCESS-TOKEN"
```

结果：

```json
{
  "created_time": "2017-04-06T22:04:21+0000",
  "from": {
    "name": "My Facebook Page",
    "id": "PAGE-ID"
  },
  "id": "POST_ID",
  "message": "Hello",
}
```

请参阅每个端点的[参考文献资料](https://developers.facebook.com/docs/graph-api/reference)，了解各个端点是否支持**先写后读**功能，以及可使用哪些字段。

**错误**

如果读取因故失败（例如，请求返回不存在的字段时失败），则图谱 API 会用标准错误响应作出回应。请查看我们的[错误处理指南](https://developers.facebook.com/docs/graph-api/guides/error-handling)了解更多信息。

通常可以通过对对象编号执行 DELETE 操作删除节点，如帖子或照片节点：

```code
curl -i -X DELETE \
  "https://graph.facebook.com/PHOTO-ID?access_token=ACCESSS-TOKEN"
```

通常仅可删除自己创建的节点，但请参阅每个节点的参考指南，了解删除操作相关要求。



#### 分页

**基于游标的分页**（最有效的分页方法）

- 游标是一个随机字符串，用于标记数据列表中的特定对象
- 但是对象删了，游标就失效了，所以游标不能存储

响应示例：

```json
{
  "data": [
     ... Endpoint data is here
  ],
  "paging": {
    "cursors": {
      "after": "MTAxNTExOTQ1MjAwNzI5NDE=",
      "before": "NDMyNzQyODI3OTQw"
    },
    "previous": "https://graph.facebook.com/{your-user-id}/albums?limit=25&before=NDMyNzQyODI3OTQw"
    "next": "https://graph.facebook.com/{your-user-id}/albums?limit=25&after=MTAxNTExOTQ1MjAwNzI5NDE="
  }
}
```

- `before`：这是指向已返回的数据页面开头的游标
- `after`：这是指向已返回的数据页面末尾的游标
- `limit`：每页的个数
- `next`：将返回下一页数据。如果未包含，则显示的是最后一页数据
- `previous`：将返回上一页数据。如果未包含，则显示的是第一页数据

**基于时间的分页**

时间分页使用指向数据列表中特定时间的 Unix 时间戳在结果数据中导航

响应示例：

```json
{
  "data": [
     ... Endpoint data is here
  ],
  "paging": {
    "previous": "https://graph.facebook.com/{your-user-id}/feed?limit=25&since=1364849754",
    "next": "https://graph.facebook.com/{your-user-id}/feed?limit=25&until=1364587774"
  }
}
```

- `until`：Unix 时间戳或指向基于时间的数据范围末尾的 `strtotime`数据值（格式文本转Unix 时间戳）
- `since`：Unix 时间戳或指向基于时间的数据范围开头的 `strtotime`数据值（格式文本转Unix 时间戳）
- `limit`：每页的个数
- `next`：将返回下一页数据
- `previous`：将返回上一页数据

**基于偏移的分页**

如果时间顺序对您不重要，且您只需要返回特定数量的对象，则可以使用偏移分页。

- 只有连线不支持基于游标或时间的分页时，才能使用这种分页方法。
- 如果正在分页的项目列表添加了新的对象，每个基于偏移的页面的内容都将发生更改

- `offset`：这将按指定的数字偏移每个页面的开头。
- `limit`：每页的个数
- `next`：将返回下一页数据
- `previous`：将返回上一页数据

**分页参数的位置和格式**

在请求参数中添加  edge.limit(n) 参数

如获取所有帖子

```sh
curl -i -X GET "https://graph.facebook.com/me/feed?access_token=ACCESS-TOKEN"
```

获取3个帖子

```sh
curl -i -X GET "https://graph.facebook.com/me?fields=feed.limit(3)&access_token=ACCESS-TOKEN"
```

> 注意：
>
> - edge（边）不在路径中了，而在参数中的fields字段中
> - 返回结果含下一页和上一页的的 url

结果

```json
{
  "feed": {
    "data": [
      {
        "created_time": "2021-12-12T01:24:21+0000",
        "message": "This picture of my grandson with Santa",
        "id": "POST-ID"
      },
      {
        "created_time": "2021-12-11T23:40:17+0000",
        "message": ":)",
        "id": "POST-ID"      
      },
      {
        "created_time": "2021-12-11T23:31:38+0000",
        "message": "Thought you might enjoy this.",
        "id": "POST-ID"      
      }
    ],
    "paging": {
      "previous": "https://graph.facebook.com/v8.0/USER-ID/feed?format=json&limit=3&since=1542820440&access_token=ACCESS-TOKEN&__paging_token=enc_AdC...&__previous=1",
      "next": "https://graph.facebook.com/v8.0/USER-ID/feed?format=json&limit=3&access_token=ACCESS-TOKEN&until=1542583212&__paging_token=enc_AdD..."
    }
  },
  "id": "USER-ID"
}
```

#### 复杂请求

```sh
GET graph.facebook.com
  /me?fields=albums.limit(5){name,photos.limit(2).after(MTAyMTE1OTQwNDc2MDAxNDkZD){name,picture,tags.limit(2)}},posts.limit(5)
```

- 获取5个相册的name、相片信息
  - 相片只要两个，包括name、图片、标签
    - 标签也只要两个

- 获取5个 posts

#### 字段别名

```sh
...me?fields=id,name,picture.width(100).height(100).as(picture_small),picture.width(720).height(720).as(picture_large)
```

- 获取个人信息：id、name、照片
  - 照片要两个，一张大的，一张小的，但是都叫 picture，所以需要起别名

结果

```json
{
  "id": "993363923726",
  "name": "Benjamin Golub",
  "picture_small": {
    "data": {
      "height": 100,
      "is_silhouette": false,
      "url": "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xft1/v/t1.0-1/p100x100/11700890_10100330450676146_2622493406845121288_n.jpg?oh=82b9abe469c78486645783c9e70e8797&amp;oe=561D10AE&amp;__gda__=1444247939_661c0f48363f1d1a7d42b6f836687a04",
      "width": 100
    }
  },
  "picture_large": {
    "data": {
      "height": 720,
      "is_silhouette": false,
      "url": "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xft1/v/t1.0-1/11700890_10100330450676146_2622493406845121288_n.jpg?oh=dd86551faa2de0cd6b359feb5665b0a5&amp;oe=561E0B46&amp;__gda__=1443979219_f1abbbdfb0fb7dac361d7ae02b460638",
      "width": 720
    }
  }
}
```

不知道别名的字段会报错

```json
{
  "error": {
    "message": "(#100) Unknown fields: my_name.",
    "type": "OAuthException",
    "code": 100
  }
}
```

#### 断点续传

[官方说明](https://developers.facebook.com/docs/graph-api/guides/upload)

上述官方说明是一种方式，还有很多其他端也可以实现，可参考[公共主页发视频贴的断点续传](#视频帖子)



## ————————————

## 公共主页相关接口

[完整官方文档 --- 端](https://developers.facebook.com/docs/graph-api/reference)

[公共主页相关文档](https://developers.facebook.com/docs/pages-api/)

- PSID 是用户在该主页的唯一编号

  系统针对用户展开对话的每个 Facebook 公共主页，为用户分配了唯一公共主页范围编号 (PSID)。PSID 用于在发送消息时识别用户。

- 访问API流程

  - 通过 Facebook 登录从应用用户处获取用户访问口令。

  - 查询 `/me/accounts` 端点，以获取应用用户已允许您应用访问的公共主页的编号和公共主页访问口令。

  - 获取返回的公共主页编号和公共主页访问口令。

  - 使用该编号和口令查询公共主页节点。

### 新页面判断

使用主页`has_transitioned_to_new_page_experience`字段确定您的主页是否已迁移到新主页体验

- 新页面体验 API 不支持以下端点及其字段，调用时将返回错误。
  - `/PAGE-ID/likes`
  - `/PAGE-ID/global_brand_children`
  - `/PAGE-ID/tabs`
  - `/PAGE-ID/visitor_posts`

[不可用的字段](https://developers.facebook.com/docs/pages-api/new-pages-experience)

### 所需权限

- `read_insights`
- `ads_management`
- `ads_read`
- `pages_messaging`
- `pages_show_list`
- `pages_read_engagement`
- `pages_read_user_content`
- `pages_manage_metadata`
- `pages_manage_posts`

- `pages_manage_engagement`

- `publish_video` 权限（如果您要在公共主页发布视频）
- 使用企业系统用户，则需要 `business_management` 权限

### 管理

#### 获取其他用户权限

只有管理员才能获取

```sh
curl -i -X GET "https://graph.facebook.com/page_id/roles"
```

返回

```json
{
  "data": [
    {
      "name": "Person One",
      "id": "page_scoped_id_for_one"
        "tasks": [
          "ANALYZE"
        ]
    },
    {
      "name": "Person Two",
      "id": "page_scoped_id_for_two",
      "tasks": [
        "ANALYZE",
        "ADVERTISE",
        "MODERATE",
        "CREATE_CONTENT",
        "MANAGE"
      ]
    },
...
  ],
}
```

#### 公共主页详细信息

必须是管理员

需要公共主页公开内容访问权限功能

可以使用 `/pages/search` 端点找到公共主页编号。

```sh
curl -i -X GET "https://graph.facebook.com/page_id \
     ?fields=about,attire,bio,location,parking,hours,emails,website"
```

#### 更新详细信息

```sh
curl -i -X POST "https://graph.facebook.com/v18.0/page_id" \
     -H "Content-Type: application/json" \
     -d '{
           "about":"This is an awesome cafe located downtown!",
         }'
```

#### 公共主页设置列表

管理员

```sh
curl -i -X GET "https://graph.facebook.com/v18.0/page_id/settings"
```

#### 更新设置

管理员

```sh
curl -i -X POST "https://graph.facebook.com/v18.0/page_id/settings" \
     -H "Content-Type: application/json" \
     -d '{
           "option":{"USERS_CAN_MESSAGE": "true"},
         }'
```

#### 获取点评

```sh
curl -i -X GET "https://graph.facebook.com/page_id/ratings" 
```

- `created_time`，设置为点评的创建时间
- `recommendation_type`，设置为 `positive` 或 `negative`
- `review_text`，设置为点评内容
- `reviewer` 对象，其中包含该点评用户的 `name` 和 `id`

```json
{
  "data": [
    {
      "created_time": "unixtimestamp",
      "recommendation_type": "positive",
      "review_text": "I love this page!",
      "reviewer": {
        "name": "Person One",
        "id": "psid_for_one"
      }
    },
    {
      "created_time": "unixtimestamp",
      "recommendation_type": "positive",
      "review_text": "This page is wonderful!",
      "reviewer": {
        "name": "Person Two",
        "id": "psid_for_two"
      }
    },
...
  ]
}
```

#### 屏蔽用户点评

禁止发布点评

```sh
curl -i -X POST "https://graph.facebook.com/v18.0/page_id/blocked"
     -H "Content-Type: application/json" \
     -d '{
           "user":"psid_to_block",
         }'
```

### 建议整改

**结合 [Webhooks](#专用Webhooks)**订阅建议



#### 建议的获取

```sh
curl -i -X GET "https://graph.facebook.com/{page-id}
    ?access_token={page-access-token}"
```

返回

```json
{
  "data": [
    {
      "id": "{proposed-change-1-id}", 
      "page": {
        "name": "My Page",
        "id": "{page-id}"   
      },
      "effective_time": "2017-10-16T10:19:49+0000",
      "timer_status": "stopped",           //this proposal was accepted or rejected
      "change_type": "knowledge_proposal",
      "proposal": {
        "id": "1570719759662530",
        "category": "category",
        "current_value": "273819889375819, 161516070564222, 152142351517013",
        "proposed_value": "273819889375819, 161516070564222, 152142351517013, 273819889375819"
      }
    },
    {
      "id": "{proposed-change-2-id}",
      "page": {
        "name": "My Page",
        "id": "{page-id}"
      },
      "effective_time": "2017-11-21T07:03:54+0000",
      "timer_status": "already_fired",   //this proposal was automatically accepted
      "change_type": "knowledge_proposal",
      "proposal": {
        "id": "1603101113091061",
        "category": "category",
        "current_value": "273819889375819, 161516070564222, 152142351517013",
        "proposed_value": "273819889375819, 161516070564222, 152142351517013, 273819889375819",
        "acceptance_status": "accepted"
      }
    }
  ]
}
```

#### 建议的更新（接收/拒绝）

[建议的类别（Page Change Proposal Categories）](https://developers.facebook.com/docs/pages/upcoming-changes)

```sh
curl -i -X POST "https://graph.facebook.com/{proposal-id}
     ?accept=true
     &access_token={page-access-token}"
```

### 帖子



#### 发布帖子

- message：文本
- link：文字链的url
- published：true为立即发布（默认），false需要传scheduled_publish_time计划发布时间
  - 整数 UNIX 时间戳 [以秒为单位]（例如`1530432000`）
  - ISO 8061时间戳字符串（例如`2018-09-01T10:15:30+01:00`）
  - 任何可由 PHP 的`strtotime()`函数解析的字符串（例如`+2 weeks`, `tomorrow`）
  - 发布日期必须在 API 请求后 10 分钟到 30 天之间。
- targeting.geo_locations 或 feed_targeting.geo_locations：受众群体
  - 在某些情况下，同时使用国家/地区和该国家/地区内的地区会导致错误 "Some of your locations overlap. Try removing a location."  位置重叠

```sh
curl -X POST "https://graph.facebook.com/v18.0/page_id/feed" \
     -H "Content-Type: application/json" \
     -d '{
           "message":"your_message_text",
           "link":"your_url",
           "published":"false",
           "scheduled_publish_time":"unix_time_stamp_of_a_future_date",
           "targeting": {
             "geo_locations": {
               "countries": [
                 "CA"
               ],
               "cities": [
                 {
                   "key": "296875",
                   "name": "Toronto"
                 }
               ]
             }
           },
           ...
         }'
```

返回

```json
{
  "id": "page_post_id"	// 页面帖子 ID 
}
```

#### 获取帖子

- **过期帖子** – 如果帖子已过期，您将无法再使用图谱 API 查看帖子的内容。
- **最大帖子读取量**
  - API 每年返回大约 600 个经排名的已发布帖子。
  - 由于 `limit` 字段的限制，您最多只能读取 100 个动态帖子。如果尝试读取更多帖子，您会收到告知您不要超过 100 个帖子的错误消息。
- **已发布的帖子** - 查询 /{page-id}/feed 端点时，系统将返回已发布的帖子和未发布的帖子。使用 is_published 字段可仅返回已发布的帖子。
- fields
  - comments.filter(stream)：所有评论
  - attachments
    - description：附件说明
    - media.image.src：缩略图
    - target.id：图片、视频id
    - attachments{media{source}}：视频地址
  - created_time：创建时间
  - full_picture：附件全尺寸图片，最大720像素，超过自动调整
  - is_popular：是否热门
  - is_published：是否已发布
  - updated_time：创建、更新、评论
  - icon：帖子类型图标
  - properties：视频的属性列表，例如视频长度。k-v结构
  - 

```sh
curl -i -X GET "https://graph.facebook.com/v18.0/page_id/feed?access_token=page_access_token"
```

返回

```json
{
  "data": [
    {
      "created_time": "2020-03-25T17:33:34+0000",
      "message": "Hello World!",
      "id": "422575694827569_917077345377399"  
    },
...
  ]
}
```

#### 更新帖子

- message
- is_published
- attached_media

```sh
curl -X POST "https://graph.facebook.com/v18.0/page_post_id" \
     -H "Content-Type: application/json" \
     -d '{
           "access_token": "",
           "message":"I am updating my Page post",
         }'
```

#### 删除帖子

```sh
curl -i -X DELETE "https://graph.facebook.com/v18.0/page_post_id"
```

### 图片帖子

[官方文档](https://developers.facebook.com/docs/graph-api/reference/page/photos/)

> **文件大小不能超过 4MB。对于 .png 文件，我们建议大小不要超过 1MB，否则图片可能会出现马赛克。**

#### 单图片

```sh
curl -X POST "https://graph.facebook.com/v18.0/page_id/photos" \
     -H "Content-Type: application/json" \
     -d '{
           "url":"path_to_photo",
```

返回

```json
{
  "id":"photo_id,
  "post_id":"page_post_id" 
}
```

#### 多图片

> **成功上传后，Graph API 会提供包含照片 ID 的响应。当您上传未发布的照片后，Facebook 会将其存储为临时上传状态，这意味着它将在 Facebook 服务器上保留大约 24 小时。如果您未在 24 小时内发布这些照片，我们将删除它们。**

**文件换id**

- picture：缩略图
- source：原图url
- 还可以用images,webp_images得到不同尺寸的url

```sh
curl -X POST \
  "https://graph-video.facebook.com/v18.0/134968929707951/photos?fields=picture,source" \
  -d "access_token=EAADd..." \
  -d "source=..." \
  -d "published=false"
```

返回

```json

```

**url换id(不本地存储的话基本用不到)**

加一个不发的参数`published=false`，返回图片id

```sh
curl -i -X POST \
 -d "url=https://www.facebook.com/images/fb_icon_325x325.png" \
 -d "published=false" \
 -d "access_token=<access_token>" \
 "https://graph.facebook.com/v18.0/page_id/photos"
```

**通过id发帖**

134968929707951_122107973408095105，134968929707951_122107973180095105



`attached_media`参数是图片id对象的数组

```sh
curl -i -X POST \
 -d "message=Testing multi-photo post!" \
 -d "attached_media[0]={"media_fbid":"1002088839996"}" \
 -d "attached_media[1]={"media_fbid":"1002088840149"}" \
 -d "access_token=<access_token>" \
 "https://graph.facebook.com/v18.0/page_id/feed"
```

> 通过id获取url
>
> ```http
>GET https://graph.facebook.com/v18.0/fbid?fields=images,webp_images,source
> 
> ## source为原图的url，取images中的source即可，webp_images更好，但是可能部分浏览器不支持
> ```
> 
> 删除（可以不删，应该不影响）
>
> ```http
>DELETE https://graph-video.facebook.com/v18.0/fbid
> ```
> 

### 视频帖子

[官方文档](https://developers.facebook.com/docs/graph-api/reference/page/videos#Creating)

#### 可续传

> **坑点**
>
> 1. 这里的可续传是为了避免上传超时，切成多个小块，当遇到连接错误时，可以重新上传当前块，无法实现真正意义的切片断点上传
> 2. 文档中按顺序逐个上传有误导性，而且也不需要根据响应结果的 `start_offset` 和 `upload_session_id`而切片，可以自己切好，并行上传
> 3. 但是注意最后一个块要单独处理，一定要等其他块都上传完再上传最后一个块，否则后续的块都会上传失败，其实，当最后一个块上传完后，FaceBook后端期望是终止会话，但还有块在上传，当做误操作，所以后续上传的块都会异常，而结束会话节点返回成功，**故，要保证最后一个块最后上传**

- 第一步：建立会话

  - upload_phase：start

  - file_size：总大小，字节

    ```sh
    curl -X POST \
      "https://graph-video.facebook.com/v18.0/1755847768034402/videos" \
      -F "upload_phase=start" \
      -F "access_token=EAADI..." \
      -F "file_size=22420886"
    ```

    返回

    ```json
    {
      "video_id":"2918040888250909",          //Capture this value (optional)
      "start_offset":"0",                     //Capture this value
      "end_offset":"1048576",
      "upload_session_id":"2918040901584241"  //Capture this value
    }
    ```

- 上传块

  - upload_phase：transfer
  - upload_session_id：上传会话的编号。
  - start_offset：上一个响应中返回的 `start_offset` 值。
  - video_file_chunk：要上传的视频块的名称。

  ```sh
  curl -X POST \
    "https://graph-video.facebook.com/v18.0/{page-id}/videos"  \
    -F "upload_phase=transfer" \
    -F "upload_session_id={upload-session-id}" \
    -F "access_token={access-token}" \
    -F "start_offset={start-offset}" \
    -F "video_file_chunk=@/Users/...xaa"
  ```

- 结束上传

  - upload_phase：finish
  - upload_session_id
  - thumb ：视频缩略图（可选）
  - description：描述，即帖子文字
  
  ```sh
  curl -X POST \
    "https://graph-video.facebook.com/v18.0/1755847768034402/videos"  \
    -F "upload_phase=finish" \
    -F "access_token={access-token}" \
    -F "upload_session_id={upload-session-id}" \
    -F "thumb=@/Users/...thumbnail_image.png"
  ```

#### 不可续传

不推荐[不切片上传](https://developers.facebook.com/docs/video-api/guides/publishing)

> **坑点**
>
> 1. description：中文和emoji都会乱码
> 2. 视频大小不得超过 1GB，且时长不得超过 20 分钟，**已验证，20分钟是胡扯**
> 3. Java调用Http请求时，以本地文件上传的方式文件过大会报错，远程文件上传成功率高，这也是官方推荐用可续传api的原因

- 本地文件上传

  ```sh
  curl -X POST \
    "https://graph-video.facebook.com/v18.0/1755847768034402/videos" \
    -F "access_token=EAADd..." \
    -F "source=@/Users/...incredible.mov"
  ```

- 远程文件上传

  ```sh
  curl -X POST \
    "https://graph-video.facebook.com/v18.0/1755847768034402/videos" \
    -F "access_token=EAADd..." \
    -F "file_url=https://socialsizz.../incredible.mov"
  ```

- 缩略图可选    `-F "thumb=@/Users/...thumbnail_image.png"`

#### 视频草稿

- 上述第一步创建会话时会返回video_id

- 根据video_id查询url、所属的帖子

  - source：url
  - post_id：帖子id
  - picture：缩略图url

  ```http
  GET https://graph-video.facebook.com/v18.0/1341015110124624?fields=post_id,source
  ```

- 将帖子置为发布状态

  ```http
  POST https://graph-video.facebook.com/v18.0/134968929707951_122100246062095105
  
  {
    "is_published": "true"
  }
  ```

- 或者直接通过video节点发布

  ```http
  POST https://graph-video.facebook.com/v18.0/1483041225875914
  
  {
    "published": "true"
  }
  ```

  

### 评论、@

#### 获取评论

- fields
  - can_hide：是否可隐藏
  - can_remove：是否可删除
  - can_reply_privately：是否可私信
  - is_hidden
  - from：评论作者
    - id
    - name
    - picture：有点能打开，有的不能
      - data.url：地址
      - data.is_silhouette：是否是托底
  - message：评论内容
  - created_time：评论时间
  - comment_count：该层级下的评论数
  - parent：父评论，拆成一个层级可用来回复
  - attachment：附件信息
    - type：video_inline（视频）、sticker（贴纸）、photo（图片）
    - target.id：拿到video_id
    - media.image.src：图片地址或视频帧地址
- filter
  - toplevel：默认顶层，此筛选参数可用于显示评论，并能采用这些评论在 Facebook 上显示的相同结构。
  - stream：各层
- live_filter --- 只适用于直播的评论
  - filter_low_quality：默认开启低质量过滤
  - no_filter：不过滤
- order
  - chronological：旧到新
  - reverse_chronological：新到旧
  - 默认ranked

```sh
curl -i -X GET "https://graph.facebook.com/page_post_id/comments?fields=from,message"
```

返回

```json
{
  "data": [
    {
      "created_time": "2020-02-19T23:05:53+0000",
      "from": {
        "name": "commentor_name",
        "id": "commentor_PSID"
      },
      "message": "comment_content",
     "id": "comment_id"
    }
  ],
  "paging": {
    "cursors": {
      "before": "MQZDZD",
      "after": "MQZDZD"
    }
  }
}
```

**内层评论**

添加parent字段，为null则是根，不为null则找父评论

**媒体评论**

添加attachment字段，返回

```json
{
  "attachment": {
    "media": {
      "image": {
        "height": 171,
        "src": "https://scontent-hkg4-1.xx.fbcdn.net/v/t39.30808-6/395640966_122099516444095105_3204954755550804247_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=5f2048&_nc_ohc=-6vEKS4aueEAX9Yq0YU&_nc_ht=scontent-hkg4-1.xx&edm=ANsyT80EAAAA&oh=00_AfC7vhKEYqg0ZkO5nJixvykDrI2C5Nsu655i4_qA4ScFdg&oe=65445AF9",
        "width": 224
      }
    },
    "target": {
      "id": "122099516450095105",
      "url": "https://www.facebook.com/photo.php?fbid=122099516450095105&set=p.122099516450095105&type=3"
    },
    "type": "photo",
    "url": "https://www.facebook.com/photo.php?fbid=122099516450095105&set=p.122099516450095105&type=3"
  },
  "id": "122099494484095105_1309013999744518"
}
```



#### 发布、回复评论

**发布**

- page_post_id ：主页下的帖子id

```sh
curl -i -X POST "https://graph.facebook.comv18.0/page_post_id/comments" \
     -H "Content-Type: application/json" \
     -d '{
           "message":"your_message_text",
         }'
```

返回评论id

**回复**

comment_id：评论的 id

- message：文本
- attachment_id：上传到 Facebook 以添加为照片评论的未发布照片编号（用私信的附件id不好使）
- attachment_share_url：动图网址
- attachment_url：图片网址
- source：本地图片、视频

```sh
curl -i -X POST "https://graph.facebook.comv18.0/comment_id/comments" \
     -H "Content-Type: application/json" \
     -d '{
           "message":"your_message_text @[PSID,PSID,PSID]",
         }'
```

返回评论id

#### @评论、回复

> 需要有psid，这个应该是通过好友列表拿，待验证
>
> 猜测发带@的帖子也是一样的

**带@的回复**

```sh
curl -i -X POST "https://graph.facebook.comv18.0/comment_id/comments" \
     -H "Content-Type: application/json" \
     -d '{
           "message":"your_message_text @[PSID,PSID,PSID]",
         }'
```

**带@的评论**

```sh
curl -i -X POST "https://graph.facebook.comv18.0/page_post_id/comments" \
     -H "Content-Type: application/json" \
     -d '{
           "message":"your_message_text @[PSID]",
         }'
```

返回评论id

#### 私信回复评论

[官方文档](https://developers.facebook.com/docs/messenger-platform/discovery/private-replies)

> **一个根评论只能回复一次**
>
> 需要权限 pages_messaging

- recipient：接收者
  - post_id：帖子id，回复帖子，仅仅可以回复访客发的帖子，这个暂时没有找到访客怎么发帖
  - comment_id：回复评论的id

- message：回复的消息
  - text：文本消息
  - attachment：附件
    - type：类型，template模板


```sh
curl -X POST -H "Content-Type: application/json" -d '{
    "recipient": {
        "comment_id": "COMMENT_ID"
    },
    
    "message": {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"Of course, what is your budget for the gift?",
          "buttons":[
              {
                  "type": "postback",
                  "title": "LESS THAN $20",
                  "payload": "GIFT_BUDGET_20_PAYLOAD"
              },
              {
                  "type": "postback",
                  "title": "$20 TO $50",
                  "payload": "GIFT_BUDGET_20_TO_50_PAYLOAD"
              },
              {
                  "type": "postback",
                  "title": "MORE THAN $50",
                  "payload": "GIFT_BUDGET_50_PAYLOAD"
              }
          ]
        }
      }
    }
}' "https://graph.facebook.com/v18.0/PAGE-ID/messages?access_token=<PAGE-ACCESS-TOKEN>"
```



#### 更新、（隐藏）

- 更新自己的评论时，必须带原有字段和内容，否则被移除
- 可以先通过can_hide查看是否可隐藏
- is_hidden，配置是否隐藏

```sh
curl -i -X POST "https://graph.facebook.com/v18.0/comment_id" \
     -H "Content-Type: application/json" \
     -d "message":"your_message_text @[PSID,PSID,PSID]" \
     -d "is_hidden":"true"
```

### 成效分析

#### 接口说明

> - 只为超过100赞的主页分析
> - 大部分指标24h更新
> - 公共主页的指标数据保存 2 年，尚未发布的只保留5天
> - `period`数据周期
>   - `lifetime`：数据分析可用时间段，默认2年
>   - day、week、 days_28
> - 使用`since`、`until`，一次只能看90天的数据，左闭右开
> - _unique都是独立运算，近似计算，每个计算结果没有必然关系，不适合再加和

> - `_unique`：执行特定操作的独立用户数量，但只是近似值，如`page_impressions_unique`
> - `_login`：是否登陆过FaceBook，如`page_tab_views_login_top`
> - `_logout`：是否退出过FaceBook，如`page_views_logout`
> - `_source`：表示会被细分为一系列推荐来源的指标
>   - 外部推荐按照域细分
>   - 内部推荐按照 Facebook 的特定功能细分，例如“个人主页”、“搜索”、“请求”、“智能推荐”、“投射视频”等
>   - 在这类情况下，返回的 `value` 为包含一系列键值对的对象，其中键为源名称，而值为该来源的指标
> - 带有 `*` 标记的指标当天刷新多次

**参数**

- date_preset：预设一个日期范围，如上周，昨天。如果有since或until，此参数无效

  > `enum{today, yesterday, this_month, last_month, this_quarter, maximum, data_maximum, last_3d, last_7d, last_14d, last_28d, last_30d, last_90d, last_week_mon_sun, last_week_sun_sat, last_quarter, last_year, this_week_mon_today, this_week_sun_today, this_year}`

- metric：指标列表

  - [指标名称官网说明](https://developers.facebook.com/docs/graph-api/reference/v18.0/insights)

- period：周期

  > `enum {day, week, days_28, month, lifetime, total_over_range}`

- show_description_from_api_doc：默认false，设置为 true，则返回的数据中将包含从 API 文档( https://developers.facebook.com/docs/graph-API/reference/insights )检索到的度量的附加描述

- since、until

**返回值**

- id：分析的结果的id
- description：指标的描述
- name：指标名称
- period：指标的周期
- title：指标的标题
- values：根据不同周期，对独立数据节点的分析，每条分析是一个InsightsValue
  - start_time：聚合数据的开始时间
  - end_time：聚合数据的结束时间
  - value：聚合数据的值

#### 获取单个指标

- {metric-name}：指标名称
  - page_impressions_unique

```sh
curl -i -X GET "https://graph.facebook.com/{page-id}/insights/{metric-name}
  ?access_token={page-access-token}"
```

#### 获取多个指标

```sh
curl -i -X GET "https://graph.facebook.com/{page-id}/insights
  ?metric=page_impressions_unique,page_engaged_users
  &access_token={page-access-token}"
```

#### 获取视频插播次数

```sh
curl -i -X GET \
  "https://graph.facebook.com/{page-id}/insights
    ?metric=page_daily_video_ad_break_ad_impressions_by_crosspost_status
    &period=day
    &since=2017-12-10
    &until=2017-12-14"
```

#### 获取帖子指标

```sh
curl -i -X GET "https://graph.facebook.com/{page-post-id}/insights
  ?metric=post_reactions_like_total,post_reactions_love_total,post_reactions_wow_total
  &access_token={page-access-token}"
```

#### 获取帖子单日插播次数

```sh
curl -i -X GET "https://graph.facebook.com/{page-post-id}/insights
  ?metric=post_video_ad_break_ad_impressions
  &period=day
  &since=2017-12-10
  &until=2017-12-14
  &access_token={page-access-token}"
```

#### 获取帖子总插播次数

```sh
curl -i -X GET "https://graph.facebook.com/{page-post-id}/insights
  ?metric=post_video_ad_break_ad_impressions
  &period=lifetime
  &access_token={page-access-token}"
```

#### 官方显示的粉丝数

直接查page对象

```http
https://graph.facebook.com/{{page-id}}?fields=followers_count,fan_count&access_token={{page_access_token}}
```



### 页面搜索

**粉丝较少的搜不到**

- q参数就是搜索的关键词
- fields
  - id：页面id
  - is_eligible_for_branded_content：是否有资格发布品牌内容
  - is_unclaimed：是否被企业认领
  - link：页面链接
  - name：页面名称
  - verification_status：验证状态
  - location：位置
    - city：城市
    - country：国家
    - latitude：纬度
    - longitude：经度
    - state：州
    - street：街道
    - zip：邮编

```sh
curl -i -X GET \
  "https://graph.facebook.com/pages/search?q=Facebook
  &fields=id,name,location,link
  &access_token={access-token}"
```

## Messenger相关接口

用户与您帐户之间的对话**必须由该用户发起**

### 限制与规定

#### 接收对象

recipient

- `psid` – 回复您公共主页在过去 24 小时内收到的消息时所用的用户公共主页范围编号，或已同意在 24 小时标准消息时间范围过后接收您公共主页所发送消息的用户的公共主页范围编号
- `user_ref` – 针对复选框或顾客聊天插件进行回复时所用的用户参照
- `comment_id` – 针对公共主页帖子的访客评论发送私信回复时所用的评论编号
- `post_id` – 针对公共主页的访客来帖发送私信回复时所用的公共主页帖子编号

#### 发送类型

messaging_type

- RESPONSE ：用于回复，遵循24小时标准消息（推广消息和非推广消息）
- UPDATE ：主动发送，遵循24小时标准消息（推广消息和非推广消息）
- MESSAGE_TAG ：使用消息标签发送的非推广消息，打破24小时（非推广消息）

#### 通知类型

notification_type

- `NO_PUSH` – 不发送通知
- `REGULAR`（默认） – 系统在用户收到消息后发出声音或震动
- `SILENT_PUSH` – 仅在屏幕上显示通知

#### 消息类型

- **[标准消息传递](https://developers.facebook.com/docs/messenger-platform/policy/policy-overview#24hours_window)**- 企业最多有 24 小时响应用户。24 小时内发送的消息可能包含促销内容。我们知道人们期望企业能够快速响应，而及时响应用户的企业会取得更好的成果。我们强烈鼓励企业尽快回复人们的信息。

  - 24 小时内发送的消息可能包含促销内容。用户可以随时选择阻止或静音与企业的对话。

    以下是在 Messenger Platform 上打开 24 小时标准消息传递窗口的用户操作示例：

    - 用户向页面发送消息
    - 用户在 Messenger 对话中点击“开始”等号召性用语按钮
    - 用户点击 Click-to-Messenger 广告，然后开始与主页对话
    - 用户通过插件（例如Send to Messenger 插件或Checkbox 插件 ）开始与页面对话。
    - 用户在现有线程上单击带有 ref 参数的 m.me 链接
    - 用户对消息做出反应。查看回复和反应

  - 有关如何在 24 小时消息传递窗口之外发送消息的信息，请参阅**消息标签**和赞助消息。

- **[消息标签](https://developers.facebook.com/docs/messenger-platform/reference/send-api)**- 使企业能够在 24 小时标准消息传递窗口之外向用户发送重要且与个人相关的 1:1 更新。我们提供了许多消息标签来支持某些用例。消息标签包括人工代理标签，允许企业在 7 天内手动回复用户消息。

- **一次性通知**- 使企业能够请求用户在 24 小时消息传递窗口结束后发送一条后续消息。

- **新闻消息**- 只有在新闻页面索引 (NPI) 中注册的页面才被允许发送非促销新闻消息。

- **赞助消息**-赞助消息允许企业在标准消息窗口之外发送促销内容。

#### 自动回复

- 响应要求
  - 自动化机器人：回复必须30s内响应
  - 自动化机器人：所有问题必须回复
- 三种机器人
  - 自动化机器人：全自动
  - 手动回复：
  - 混合机器人：结合了自动化和人类交互的机器人
- 是什么类型的机器人就设置什么类型的 ---- 没有在 7 天内回复我们的消息或进行适当的更改，我们可能会限制您的机器人发送消息的能力 ---- *页面设置 > 高级消息传递*

### 聊天记录

- 默认全部用户聊天记录
- platform：MESSENGER 或 INSTAGRAM
- user_id：查个人聊天记录

```sh
curl -i -X GET "https://graph.facebook.com/LATEST-API-VERSION/me/conversations?
	fields=participants,messages{id,message,from,to}
    &access_token=PAGE-ACCESS-TOKEN"
```

返回谈话id

> 或者根据谈话id ---CONVERSATION（谈话）端获取
>
> ```sh
> curl -i -X GET "https://graph.facebook.com/LATEST-API-VERSION/CONVERSATION-ID
>     ?fields=messages
>     &access_token=PAGE-ACCESS-TOKEN"
> ```



### 发消息

**官方文档**

- [send-api](https://developers.facebook.com/docs/messenger-platform/reference/send-api)
- [附件上传](https://developers.facebook.com/docs/messenger-platform/reference/attachment-upload-api#attachment)

> 当使用 RESPONSE 消息类型时，消息必须在 Page 接收到客户消息的24小时内发送，否则将发生错误

- message
  - `attachment` 对象 – 预览网址。用于发送带有媒体内容的消息或结构化消息。必须设置 text 或 attachment。
    
    - `type` – 附件类型。可以是 audio、file、image、template 或 video。**文件大小不得超过 25MB**。
    
    - `payload` – 包含模板或文件的对象。
      - url：**图片的文件大小不得超过 8MB，其他所有文件类型（编码后）的文件大小不得超过 25MB。视频的超时设置为 75 秒，其他所有文件类型的超时设置为 10 秒。**
      
        > 实测视频限制不准
      
      - is_reusable：true可重用
    
  - metadata – 您要在 message_echo Webhook 中传递的额外数据的字符串。必须少于 1,000 个字符
  
  - quick_replies – 要在消息中发送的快速回复的数组。
  
  - `text` – 仅包含文本的消息。必须是 UTF-8 字符且字符数少于 2,000。
  
- messaging_type
  - RESPONSE – 用于回复已收到消息的消息。这包括在 [24 小时标准消息时间范围](https://developers.facebook.com/docs/messenger-platform/policy-overview#24hours_window)内发送的推广消息和非推广消息。例如，在用户询问预约确认或状态更新情况时，您可以使用此标签回复。
  - UPDATE – 主动发出且并非用于回复已收到消息的消息。这包括在 [24 小时标准消息时间范围](https://developers.facebook.com/docs/messenger-platform/policy-overview#24hours_window)内发送的推广消息和非推广消息。
  - MESSAGE_TAG – 属于非推广消息的消息，而且是在 [24 小时标准消息时间范围](https://developers.facebook.com/docs/messenger-platform/policy-overview#24hours_window)过后使用[消息标签](https://developers.facebook.com/docs/messenger-platform/send-messages/message-tags)发出。此类消息必须符合此标签的合理用途。
  
- notification_type：用户将收到的推送通知的类型
  - NO_PUSH – 不发送通知
  - REGULAR（默认） – 系统在用户收到消息后发出声音或震动
  - SILENT_PUSH – 仅在屏幕上显示通知
  
- `recipient`
  - id – 回复您公共主页在过去 24 小时内收到的消息时所用的用户公共主页范围编号，或已同意在 24 小时标准消息时间范围过后接收您公共主页所发送消息的用户的公共主页范围编号
  - user_ref – 针对复选框或顾客聊天插件进行回复时所用的用户参照
  - comment_id – 针对公共主页帖子的访客评论发送私信回复时所用的评论编号
  - post_id – 针对公共主页的访客来帖发送私信回复时所用的公共主页帖子编号
  
- sender_action：消息窗口中显示的操作图标，表示公共主页对收到的用户消息所执行的操作。**仅可以与 recipient 参数一同发送。无法与 message 参数一同发送，而必须作为单独的请求发送。**
  - typing_on – 公共主页正在准备回复时，系统会显示输入气泡
  - typing_off – 不显示输入气泡
  - mark_seen – 公共主页阅读消息后，系统会显示“已读”图标
  
- **tag：此标签可让您的公共主页在 24 小时标准消息时间范围过后向用户发送消息。**
  - [请参阅官方文档中 --- 消息标签的合理用途](https://developers.facebook.com/docs/messenger-platform/reference/send-api)

#### 文本消息

```sh
curl -i -X POST "https://graph.facebook.com/LATEST-API-VERSION/PAGE-ID/messages
    ?recipient={id:PSID}
    &message={text:'You did it!'}
    &messaging_type=RESPONSE
    &access_token=PAGE-ACCESS-TOKEN"
```

#### 模板消息

```

```

#### 上传附件

**网络附件**

```sh
curl -X POST  "https://graph.facebook.com/v18.0/me/message_attachments" \
        -H "Content-Type: application/json" \
     	-d access_token={{access_token}}
        -d message={
            "attachment":{
              "type":"image", 
              "payload":{
                "url":"http://www.messenger-rocks.com/image.jpg", 
                "is_reusable":true
              }
            }
          }
```

**本地附件**

```sh
curl -X POST "https://graph.facebook.com/v18.0/me/message_attachments" \
		-H "Content-Type: formdata格式" \
        -d access_token={{access_token}}
        -d message={
                "attachment": {
                    "type": "image",
                    "payload": {
                        "is_reusable": true
                    }
                }
            }
        -d filedata:文件流
```

返回附件id：attachment_id

#### 发送媒体消息

```sh
curl -X POST "https://graph.facebook.com/v18.0/Your-page-id/messages" \
     -H "Content-Type: application/json" \
     -d access_token={{access_token}}
     -d message={
             "attachment":{
               "type":"image",
               "payload":{
                 "attachment_id":"Your-attachment-ID"
               }
             }
           }
```



### 用户编号互换

https://developers.facebook.com/docs/messenger-platform/identity/id-matching

### 定制标签

https://developers.facebook.com/docs/messenger-platform/identity/custom-labels

### 移交协议

https://developers.facebook.com/docs/messenger-platform/handover-protocol

将被对话[路由取代](#会话路由)

用于传递对话控制权，如自动回复到人工回复

### 会话路由

### 业务曝光

#### 直达广告

#### 聊天插件

js的SDK



## Webhooks

### 前期配置

注意：

- 只能用应用面板进行测试数据的模拟，无法真正订阅线上真实数据，即使是有应用身份的也不可以
- 无需应用审核，但是要有相应数据对象的权限

#### 验证请求

- 编写https接口，用于验证回调 ---- 必须ssl加密

  - hub.mode：固定值subscribe，不用管，接收即可
  - hub.challenge：作为返回值返回
  - hub.verify_token：应用设置里的验证口令

  ```java
  @GetMapping("/test/webhooks")
  public Object testWebhooks(@RequestParam("hub.mode") String hub_mode,
                         @RequestParam("hub.challenge") String hub_challenge,
                         @RequestParam("hub.verify_token") String hub_verify_token) {
  
      log.info("####### hub_mode = {},hub_challenge = {},hub_verify_token = {}", hub_mode, hub_challenge, hub_verify_token);
  
  
      return hub_challenge;
  }
  ```

- 在应用-产品-Webhook -设置回调地址、验证口令，并验证

### Messenger专用Webhooks

- 添加Messenger产品，在Messenger产品中设置

1. [messages](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messages)：**收**到用户给主页发消息时，**已测试成功**

   > text, attachments

   ```json
   {
       "object":"page",
       "entry":[
           {
               "id":"134968929707951",
               "time":1698637601363,
               "messaging":[
                   {
                       "sender":{
                           "id":"7689966077685933"
                       },
                       "recipient":{
                           "id":"134968929707951"
                       },
                       "timestamp":1698637600838,
                       "message":{
                           "mid":"m_G7806MxRRtEYRbaFW9DwQhGzibAfjF_0k8aXBtCrvhCCBUkL2hQxQYVrwMAV-oVdDMDMUsN7b8NAhW6kufP2Mw",
                           "text":"yes"
                       }
                   }
               ]
           }
       ]
   }
   ```

2. [message_deliveries](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/message-deliveries)：给用户发送的消息**已送达**时，**已测试成功（必须在有message_echoes前提下使用）**

   ```json
   {
       "object":"page",
       "entry":[
           {
               "time":1698636947414,
               "id":"134968929707951",
               "messaging":[
                   {
                       "sender":{
                           "id":"7689966077685933"
                       },
                       "recipient":{
                           "id":"134968929707951"
                       },
                       "timestamp":1698636947322,
                       "delivery":{
                           "mids":[
                               "m_JOIfPCZ0ZdEfzVAKbf-q7xGzibAfjF_0k8aXBtCrvhBE65I3pgY8x0JgCRNU0ufc-3xww3ZThpaKhO28QgX7Kw"
                           ],
                           "watermark":1698636946713
                       }
                   }
               ]
           }
       ]
   }
   ```

3. [message_echoes](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/message-echoes)：给用户**发**送消息时，**已测试成功**

   > is_echo

   ```json
   {
       "id":"101457812431751",
       "time":1702033749238,
       "messaging":[
           {
               "sender":{
                   "id":"101457812431751"
               },
               "recipient":{
                   "id":"24959525500305070"
               },
               "message":{
                   "attachments":[
                       {
                           "payload":{
                               "url":"https://video.xx.fbcdn.net/v/t42.3356-2/404113427_7310046289005855_3267958592431621545_n.mp4?_nc_cat=104&ccb=1-7&_nc_sid=4f86bc&_nc_ohc=Jrjz9hi_IugAX8CMYmc&_nc_ht=video.xx&oh=03_AdTSshlTzTXrC_NPJsdfUfBDTWwG7FqkLetAzI03dXJgqA&oe=6574893B"
                           },
                           "type":"video"
                       }
                   ],
                   "mid":"m_lpISezyzgmdj7S4AdRNwfBaFKDaSHKj0VwleR8zf-rPFyfEH4c1bP0rW1A7e3SPURMh-ZfQsrr6qSCZXECv4xw",
                   "app_id":1929931607227568,
                   "is_echo":true
               },
               "timestamp":1702033748942
           }
       ]
   }
   ```

4. [message_reactions](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/message-reactions)：用户对消息作出反应时（反应指的是消息旁的表情），**已测试成功**

   ```json
   {
       "object":"page",
       "entry":[
           {
               "time":1698637274708,
               "id":"134968929707951",
               "messaging":[
                   {
                       "sender":{
                           "id":"7689966077685933"
                       },
                       "recipient":{
                           "id":"134968929707951"
                       },
                       "timestamp":1698637274652,
                       "reaction":{
                           "mid":"m_QYDlT7E_AuSvLNf1ZclHIxGzibAfjF_0k8aXBtCrvhDgwJsqwtunSLKU9L7XB8aoQF1odHsDHnaOv99ud41Onw",
                           "action":"react",
                           "emoji":"\ud83d\ude22",
                           "reaction":"sad"
                       }
                   }
               ]
           }
       ]
   }
   ```

5. [message_reads](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/message-reads)：用户**已读**消息时，**已测试成功**

   ```json
   {
       "object":"page",
       "entry":[
           {
               "time":1698636961555,
               "id":"134968929707951",
               "messaging":[
                   {
                       "sender":{
                           "id":"7689966077685933"
                       },
                       "recipient":{
                           "id":"134968929707951"
                       },
                       "timestamp":1698636961023,
                       "read":{
                           "watermark":1698636960806
                       }
                   }
               ]
           }
       ]
   }
   ```

   

6. [messaging_account_linking](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_account_linking)：点击账户连接按钮时

7. messaging_feedback：

8. [messaging_game_plays](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_game_plays/)：

9. [messaging_handovers](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_handovers)：对话的所有权已从一个应用转移至另一个应用，（移交协议时 --- 暂时理解为自动回复转人工客服）

10. [messaging_optins](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_optins)：（用户已订阅来自公共主页的营销消息）用户选择接收营销消息或点击 Send to Messenger 插件时

11. [messaging_policy_enforcement](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_policy_enforcement)：不符合平台政策采取措施后（警告、封禁、解封）

    ```json
    {
      "field": "messaging_policy_enforcement",
      "value": {
        "recipient": {
          "id": "23245"
        },
        "timestamp": "1527459824",
        "policy_enforcement": {
          "action": "warning",
          "reason": "Warning reason message"
        }
      }
    }
    ```

    

12. [messaging_postbacks](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_postbacks)：

13. [messaging_referrals](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_referrals)：

14. messaging_seen：等同于message_reads，只是这个用在 Instagram 消息

15. [standby](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/standby)： 公共主页收到一条消息，但应用目前没有对话的所有权

16. [group_feed](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/group-feed)：用户给群组中的帖子发表评论时

17. messaging_payments：

18. messaging_pre_checkouts：

19. messaging_customer_information：

20. messaging_checkout_updates：

21. [inbox_labels](https://developers.facebook.com/docs/messenger-platform/handover-protocol)：用户标签，**已测试成功**

### Page专用Webhooks

用于用户动态的实时更新

#### 订阅字段

- 字段

  - feed：在公共主页动态发生变动时通知您，如发帖、发布心情、分享等。

  - messages：公共主页收到 Messenger 消息时通知您。如需所有可用的消息 Webhooks 字段列表，请参阅 [Messenger 专用 Webhooks 指南](https://developers.facebook.com/docs/messenger-platform/webhook#events)

  - 订阅 `page_upcoming_change` 或 `page_change_proposal`，纠正错别字或更新您公共主页上的类别的通知

    > 请向 `/page_change_proposal_id` 端点发送 `POST` 请求，并在其中加入 `accept` 字段（将值设为 `true` 为接受更改；将值设为 `false` 为拒绝更改）。`page_change_proposal_id` 是您在 `page_upcoming_change` Webhooks 通知中收到的 `proposal.id` 值或您在 `page_change_proposal` Webhooks 通知中收到的 `value.id` 值。
    >
    > ```sh
    > curl -i -X POST "https://graph.facebook.com/v18.0/page_change_proposal_id" \
    >   -H "Content-Type: application/json" \
    >   -d '{
    >         "accept":"true",
    >       }'
    > ```

- 权限

  - 对于 feed，需要使用 `pages_manage_metadata` 和 `pages_show_list` 权限
  - 对于 messages，还需要`pages_messaging`

- 订阅应用

  ```sh
  curl -i -X POST "https://graph.facebook.com/{page-id}/subscribed_apps
    ?subscribed_fields=feed
    &access_token={page-access-token}"
  ```

- 查看公共主页订阅的应用

  ```sh
  curl -i -X GET "https://graph.facebook.com/{page-id}/subscribed_apps &access_token={page-access-token} 
  ```

  返回

  ```json
  {
    "data": [
      {
        "category": "Business",
        "link": "https://my-clever-domain-name.com/app",
        "name": "My Sample App",
        "id": "{page-id}"
      }
    ]
  }
  ```



- 在**应用程序**下拉菜单中选择您的应用。此操作将返回应用的访问口令。
- 点击**获取口令**下拉菜单，选择**获取用户访问口令**，然后选择 `pages_manage_metadata` 权限。此操作会将您的应用口令与授予 `pages_manage_metadata` 权限的用户访问口令互换。
- 再次点击**获取口令**，然后选择您的公共主页。此操作会将您的用户访问口令与公共主页访问口令互换。
- 点击 `GET` 下拉菜单，然后选择 `POST`，即可更改操作方式。
- 将默认 `me?fields=id,name` 查询替换为公共主页的**编号**，在此编号之后输入 `/subscribed_apps`，然后提交查询。

#### 帖子消息体

##### 发布帖子 - 待发布

> "item": "status", "verb": "add", "published": 0,

```json
{
  "entry": [
    {
      "id": "370873143344730",
      "time": 1701418385,
      "changes": [
        {
          "value": {
            "from": {
              "id": "370873143344730",
              "name": "JD CENTRAL"
            },
            "message": "9999999999999",
            "post_id": "370873143344730_734388548724133",
            "created_time": 1701418378,
            "item": "status",
            "published": 0,
            "verb": "add"
          },
          "field": "feed"
        }
      ]
    }
  ],
  "object": "page"
}
```

##### 发布帖子 - 真发送

> "item": "status",  "published": 1, "verb": "add"

```json
{
  "entry": [
    {
      "id": "110322572167401",
      "time": 1701423004,
      "changes": [
        {
          "value": {
            "from": {
              "id": "110322572167401",
              "name": "JDDeveloper mt"
            },
            "message": "30",
            "post_id": "110322572167401_122141721440024251",
            "created_time": 1701422426,
            "item": "status",
            "published": 1,
            "verb": "add"
          },
          "field": "feed"
        }
      ]
    }
  ],
  "object": "page"
}
```

##### 发布图片帖子

> "item":"photo", "verb":"add", "published":1,

```json
{
    "changes":[
        {
            "field":"feed",
            "value":{
                "created_time":1701685154,
                "item":"photo",
                "post_id":"101457812431751_332029982914750",
                "photo_id":"332029742914774",
                "link":"https://scontent-hkt1-2.xx.fbcdn.net/v/t39.30808-6/407665458_332029739581441_4167626750318845542_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=ab7367&_nc_ohc=ujJFqIHMW0AAX8BxGuD&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent-hkt1-2.xx&oh=00_AfDH7EjdkXhzQhMPb8vN4PtBYZS_ynirIGhZ6vjVtWE4HQ&oe=65725A75",
                "verb":"add",
                "from":{
                    "name":"apptest02",
                    "id":"101457812431751"
                },
                "published":1,
                "message":"图片看下"
            }

        }
    ],
    "id":"101457812431751",
    "time":1701685690
}
```

##### 发布视频帖子

>  "item":"video", "verb":"add", "published":0,

```json
{
    "changes":[
        {
            "field":"feed",
            "value":{
                "created_time":1701685577,
                "item":"video",
                "post_id":"101457812431751_332032482914500",
                "link":"https://video-sea1-1.xx.fbcdn.net/v/t42.1790-2/407679049_1417265355666332_7717967206223128880_n.mp4?_nc_cat=111&ccb=1-7&_nc_sid=55d0d3&efg=eyJ2ZW5jb2RlX3RhZyI6InN2ZV9zZCJ9&_nc_ohc=O6tWhAEQw-sAX86z5w3&_nc_ht=video-sea1-1.xx&oh=00_AfDMX3GYk2lSljNsiPO-4AE0fA5cjdsa47o7dPVlcZdnzg&oe=6571C794",
                "verb":"edited",
                "from":{
                    "name":"apptest02",
                    "id":"101457812431751"
                },
                "published":0,
                "video_id":"334815795929748"
            }

        }
    ],
    "id":"101457812431751",
    "time":1701685595
}
```

##### 删除帖子 --- 垃圾箱

> "item":"status" , "verb":"edited", "published":1

```json
{
    "changes":[
        {
            "field":"feed",
            "value":{
                "created_time":1701873006,
                "item":"status",
                "post_id":"101457812431751_333244599459955",
                "verb":"edited",
                "from":{
                    "name":"apptest02",
                    "id":"101457812431751"
                },
                "published":1
            }
        }
    ],
    "id":"101457812431751",
    "time":1702034672
}
```

##### 删除帖子 --- 真删除

> "item": "post", "verb": "remove"

```json
{
  "entry": [
    {
      "id": "110322572167401",
      "time": 1701418751,
      "changes": [
        {
          "value": {
            "from": {
              "id": "110322572167401",
              "name": "JDDeveloper mt"
            },
            "post_id": "110322572167401_122141710964024251",
            "created_time": 1701418745,
            "item": "post",
            "recipient_id": "110322572167401",
            "verb": "remove"
          },
          "field": "feed"
        }
      ]
    }
  ],
  "object": "page"
}

```

##### 垃圾恢复 --- 待补充

#### 评论消息体

##### 评论

> "item": "comment", "verb": "add"

```json
{
  "entry": [
    {
      "id": "370873143344730",
      "time": 1701413579,
      "changes": [
        {
          "value": {
            "from": {
              "id": "6780462125377510",
              "name": "Changan Yang"
            },
            "post": {
              "status_type": "added_video",
              "is_published": true,
              "updated_time": "2023-12-01T06:52:51+0000",
              "permalink_url": "https://www.facebook.com/joyjdth/posts/pfbid04M7S4SRFSYCAyfYN6cSNR4RYMLnQKdwQhVyPo7ovRUHBYCqaXeB9gz5NmCBFm9FNl",
              "promotion_status": "inactive",
              "id": "370873143344730_690891113073877"
            },
            "message": "手动点赞",
            "post_id": "370873143344730_690891113073877",
            "comment_id": "690891113073877_759878495960329",
            "created_time": 1701413571,
            "item": "comment",
            "parent_id": "370873143344730_690891113073877",
            "verb": "add"
          },
          "field": "feed"
        }
      ]
    }
  ],
  "object": "page"
}
```

##### 图片评论

> "photo":"https://sconten..."

```json
{
    "created_time":1701671865,
    "item":"comment",
    "post":{
        "updated_time":"2023-12-04T06:37:45+0000",
        "promotion_status":"inactive",
        "status_type":"mobile_status_update",
        "is_published":true,
        "id":"110322572167401_122141721440024251",
        "permalink_url":"https://www.facebook.com/permalink.php?story_fbid=pfbid0sZZFdGxRfii776Z1NjycmVL6HVsESbxTxkCpXUh23C756mwojeS826TiKxA8Uqr3l&id=61550727536008"
    },
    "post_id":"110322572167401_122141721440024251",
    "parent_id":"110322572167401_122141721440024251",
    "verb":"add",
    "photo":"https://scontent-hkg4-2.xx.fbcdn.net/v/t39.30808-6/405394699_122114468852095105_8124104428754459742_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=7fe00f&_nc_ohc=yD_vx6DslH0AX-N7oN-&_nc_ht=scontent-hkg4-2.xx&oh=00_AfBjQBm-8rG4LjxoUXUGYAMz49_-KkJwjh0NOyJpIJJFgA&oe=65723DB2",
    "from":{
        "name":"Play play2",
        "id":"134968929707951"
    },
    "comment_id":"122141721440024251_657063669920574"
}
```



##### 隐藏评论

>  "verb":"hide",

```json
{
    "changes":[
        {
            "field":"feed",
            "value":{
                "created_time":1701684706,
                "item":"comment",
                "post":{
                    "updated_time":"2023-12-04T03:38:42+0000",
                    "promotion_status":"inactive",
                    "status_type":"mobile_status_update",
                    "is_published":true,
                    "id":"101457812431751_331881159596299",
                    "permalink_url":"https://www.facebook.com/permalink.php?story_fbid=pfbid02wFArvUKS8HkiVApJX1tPuzpNXkXMUyzEzuAnsokgETg7gSas6hEppH417Prsp5nnl&id=100083232529817"
                },
                "post_id":"101457812431751_331881159596299",
                "parent_id":"101457812431751_331881159596299",
                "verb":"hide",
                "from":{
                    "name":"apptest02",
                    "id":"101457812431751"
                },
                "message":"一试就成",
                "comment_id":"331881159596299_1735528193537632"
            }
        }
    ],
    "id":"101457812431751",
    "time":1701684708
}
```

##### 取消隐藏评论

>  "verb":"unhide",

```json
{
    "changes":[
        {
            "field":"feed",
            "value":{
                "created_time":1701685568,
                "item":"comment",
                "post":{
                    "updated_time":"2023-12-04T03:38:42+0000",
                    "promotion_status":"inactive",
                    "status_type":"mobile_status_update",
                    "is_published":true,
                    "id":"101457812431751_331881159596299",
                    "permalink_url":"https://www.facebook.com/permalink.php?story_fbid=pfbid02wFArvUKS8HkiVApJX1tPuzpNXkXMUyzEzuAnsokgETg7gSas6hEppH417Prsp5nnl&id=100083232529817"
                },
                "post_id":"101457812431751_331881159596299",
                "parent_id":"101457812431751_331881159596299",
                "verb":"unhide",
                "from":{
                    "name":"apptest02",
                    "id":"101457812431751"
                },
                "message":"一试就成",
                "comment_id":"331881159596299_1735528193537632"
            }
        }
    ],
    "id":"101457812431751",
    "time":1701685569
}
```

##### 删除评论 --- 待补充

#### 私信消息体

见[Messenger专用Webhooks](#Messenger专用Webhooks)

```
{
  "object": "page",
  "entry": [
    {
      "id": "370873143344730",
      "time": 1701427705708,
      "messaging": [
        {
          "sender": {
            "id": "6780462125377510"
          },
          "recipient": {
            "id": "370873143344730"
          },
          "timestamp": 1701427704837,
          "message": {
            "mid": "m_EYIjld_07gZyN02MY6vztOXzGkvslWQkbqadVHtQ-MRw2PakktSufK_6Pz_0PTnbOC72fWaxZLT-IC7sPF7etg",
            "text": "测试私信"
          }
        }
      ]
    }
  ]
}
```





```

```



评论、（回复评论）、隐藏评论、取消隐藏评论

删除帖子（垃圾桶、真删）、编辑帖子（图文）

发送私信，收到私信

## ————————————

## 错误处理

[通用错误官方文档](https://developers.facebook.com/docs/graph-api/guides/error-handling)

### 限流

[参考流量控制](#流量控制)

- 错误信息

  ```json
  {
      "error":{
          "message":"(#4) Application request limit reached",
          "type":"OAuthException",
          "is_transient":true,
          "code":4,
          "fbtrace_id":"Arh2gqLppNgpXBQMILRJ8lm"
      }
  }
  ```

  

- 从您的应用接收到足够请求后，端点会在其响应中包含一个`X-App-Usage`或`X-Ad-Account-Usage`（适用于 v3.3 及更低版本的广告 API 调用）HTTP 标头。此标头将包含一个 JSON 格式的字符串，用于说明当前应用程序流量限制的使用情况。

  | 键              | 值描述                                                     |
  | --------------- | ---------------------------------------------------------- |
  | `call_count`    | 用于表示您的应用在连续一小时内发出的调用所占百分比的整数。 |
  | `total_cputime` | 用于表示为查询处理分配的 CPU 时间所占百分比的整数。        |
  | `total_time`    | 用于表示为查询处理分配的总时间所占百分比的整数。           |

  `总 CPU 时间：`处理请求所需的 CPU 时长。当`total_cputime`达到 100 时，系统可能会对调用进行节流

  `总时长：`处理请求所需的时长。当`total_time`达到 100 时，系统可能会对调用进行节流。

  

  ```
  x-app-usage={"call_count":68,"total_cputime":0,"total_time":208}
  ```

### 主页

[新Page错误官方文档](https://developers.facebook.com/docs/pages-api/error-codes)

评论比较坑的是：没有给文件加content-type也会报这个错

```json
{
    "error":{
        "message":"(#200) Permissions error",
        "type":"OAuthException",
        "code":200,
        "fbtrace_id":"AbUhinTvMOkPfgH-hzBJKfQ"
    }
}
```

视频评论

- 大文件发布失败，413,目前测试80m没问题，200多兆的有问题，竞品4m
- 也存在延时问题，官方文档说视频、GIF 评论存在延迟，让我们重试
- 只有一张图的url，无法直接获取到视频的url，需要再查一次接口

### 私信

[官方文档](https://developers.facebook.com/docs/messenger-platform/error-codes)

- 200-1545041、551-1545041：拉黑了，屏蔽了

```json
{
    "error": {
        "message": "(#551) 用户暂时收不到消息。",
        "type": "OAuthException",
        "code": 200,
        "error_subcode": 1545041,
        "fbtrace_id": "AxTByfgzd8fqNieOe1cQIz2"
    }
}

{
    "error":{
        "message":"(#551) This person isn't available right now.",
        "type":"OAuthException",
        "code":551,
        "error_subcode":1545041,
        "fbtrace_id":"AfLpdQHj4s1h8w6MbvPPOUc"
    }
}
```

- 10–2534022、10–2018278：收到消息后24h内可发消息
  - 此消息在允许的窗口之外发送。

  - 应用程序只能在收到客户消息后 24 小时内向客户发送消息。

  - 10–2018065：此消息在允许的窗口之外发送。您需要[新闻消息权限](https://developers.facebook.com/docs/messenger-platform/policy/policy–overview/#news_messaging)才能执行此操作
- 10–2018108：此人无法接收消息：此人现在没有接收来自您的消息。（应该是拒收）

```json
{
    "error": {
        "message": "(#10) 这条消息是在消息发送时间窗以外发送的。请在这里详细了解新政策：https://developers.facebook.com/docs/messenger-platform/policy-overview",
        "type": "OAuthException",
        "code": 10,
        "error_subcode": 2018278,
        "fbtrace_id": "AdSBrmIpW02GvBiXC4X4CfL"
    }
}

{
    "error":{
        "message":"(#10) This message is sent outside of allowed window. Learn more about the new policy here: https:\/\/developers.facebook.com\/docs\/messenger-platform\/policy-overview",
        "type":"OAuthException",
        "code":10,
        "error_subcode":2018278,
        "fbtrace_id":"AxIIVeNpuf3y2jeXdufRcEX"
    }
}
```



- 100-2018047：提供的素材类型与网址中所提供文件的类型不一致，检查 Content-Type

  - 上传附件失败。通常，触发此错误的原因是提供的素材类型与网址中所提供文件的类型不一致

  - 在拼接form-data时content-type为空，应该设置为对应的mime类型

```json
{
    "error":{
        "message":"(#100) Upload attachment failure.",
        "type":"OAuthException",
        "code":100,
        "error_subcode":2018047,
        "fbtrace_id":"AN1pzAEZj4AwdT5gygdvNXL"
    }
}
```



### 口令

[官网说明](https://developers.facebook.com/docs/facebook-login/guides/%20access-tokens/debugging)

时间是可能变得，最好通过错误来重新获取口令

**过期口令响应示例**

```json
{
  "error": {
    "message": "Error validating access token: Session has expired on Wednesday, 14-Feb-18 18:00:00 PST. The current time is Thursday, 15-Feb-18 13:46:35 PST.",
    "type": "OAuthException",
    "code": 190,
    "error_subcode": 463,
    "fbtrace_id": "H2il2t5bn4e"
  }
}
```

**无效口令响应示例**

当用户退出应用程序或更改密码时，系统便会发出此响应。

```json
{
  "error": {
    "message": "Error validating access token: The session is invalid  because the user logged out.", 
    "type": "OAuthException", 
    "code": 190,
    "error_subcode": 460,
    "fbtrace_id": "H2il2t5bn4e"
  }
}
```

**取消授权口令响应示例**

```json
{
  "error": {
    "message": "Error validating access token: User {user-id} has not authorized application {your-app-id}.", 
    "type": "OAuthException", 
    "code": 190,
    "error_subcode": 458,
    "fbtrace_id": "H2il2t5bn4e"
  }
}
```



## 常见问题

[开发相关](https://developers.facebook.com/support/faq?locale=zh_CN)

### 概念相关

**应用生态体系**

- **Facebook主应用**：这是最初的Facebook社交网络应用，用户可以在此发布状态更新、分享链接和图片、交流消息、参加活动，等等。
  - **Reels** --- 用于发布、观看短视频，由视频、音乐、音频和特效等组成。您可以针对全球分享对象创建 Reels
  - **快拍** --- 与好友及粉丝分享日常点滴，快拍仅在 24 小时内可见（有效期24h），但您随时可以在快拍私人影集中回顾分享过的快拍
  - **照片** --- 与好友和家人分享照片和视频
  - **视频** --- 用于发布、观看长视频，
  - **个人主页** ----  个人页面，用户可以通过它分享兴趣、照片、视频、所在地和家乡等个人信息。创作者也可以通过开启专业模式，在个人主页上与粉丝建立联系
  - **公共主页** ---- 相当于认证号，可以创建或管理公共主页，艺术家、公众人物、商家、品牌、组织和非营利机构可以通过它与他们的粉丝或客户建立联系
  - **小组** ---- 相当于群聊，为志趣相投的用户提供了交流空间
  - Facebook 友缘 --- 仅支持手机移动端，成年账号，注册满30天，有地区限制
- **Messenger**：这是Facebook的即时通讯应用，允许用户通过文本、语音、视频和其他形式进行交流。

- **Instagram**：这是一个基于图片和视频的社交网络应用，用户可以分享和发现照片和视频，以及通过Instagram Stories和Instagram Live进行实时分享。

- **WhatsApp**：这是一个即时通讯应用，允许用户通过文本、语音、视频和其他形式进行交流。它在全球范围内非常流行，尤其是在欧洲、亚洲和拉丁美洲。

- **Oculus**：这是Facebook的虚拟现实平台，主要用于游戏和娱乐。

- **Workplace**：这是一个为企业和组织提供的协作工具，类似于Facebook主应用，但是专为工作场景设计

- Meta Business Suite：全面的商业管理平台，允许企业在Facebook、Instagram和Messenger上管理他们的存在。企业可以发布内容，管理广告，查看分析数据，以及与顾客进行交流
  




### 公共主页相关

#### 页面上查看公共主页编号

[查看编号直达链接](https://www.facebook.com/profile.php?id=61552571521856&sk=about_profile_transparency)

<img src="http://minio.botuer.com/study-node/imgs/16-获取token/image-20231019193130772.png" alt="image-20231019193130772" style="zoom:30%;" />

#### API获取公共主页编号

```sh
curl -i -X GET "https://graph.facebook.com/v18.0/user_id/accounts?access_token=user_access_token"
```

返回

```json
{
  "data": [
    {
      "access_token": "<b><i>page_access_token</i></b>",
      "category": "Internet Company",
      "category_list": [
        {
          "id": "2256",
          "name": "Internet Company"
        }
      ],
      "name": "Name of this Page",
      "id": "<b><i>page_id</i></b>",
      "tasks": [
        "ANALYZE",
        "ADVERTISE",
        "MODERATE",
        "CREATE_CONTENT"
      ]
    },
...
```



#### 修改类别

<img src="http://minio.botuer.com/study-node/imgs/16-获取token/image-20231020171731970.png" alt="image-20231020171731970" style="zoom:33%;" />

#### 删除公共主页

在公共主页视角下：设置与隐私 --- 设置 --- 隐私 ---- Facebook 公共主页信息 ---- 停用和删除   

[删除主页直达链接](https://www.facebook.com/settings?tab=your_facebook_information)



#### 身份与权限

[权限设置直达](https://www.facebook.com/settings?tab=profile_access)

旧版叫公共主页用户身份，新版叫管理权限或任务权限

以下是新旧对比

| 经典版公共主页用户身份 | 新版公共主页体验中的公共主页权限           |
| ---------------------- | ------------------------------------------ |
| 管理员                 | 拥有完全控制权的 Facebook 管理权限         |
| 编辑                   | 拥有部分控制权的 Facebook 管理权限         |
| 版主                   | 消息回复、社群动态、广告、成效分析任务权限 |
| 广告主管               | 广告、成效分析任务权限                     |
| 分析员                 | 成效分析任务权限                           |
| 社群管理员             | 社群管理员管理直播聊天的权限               |

**FaceBook 管理权限**

- 内容：创建、管理或删除公共主页上的任何内容，例如帖子、快拍等。申请和使用管理原创内容的权利以及可能由此内容变现的方法。
- 消息：在收件箱中以公共主页身份回复私信。
- 评论：回复公共主页上的评论，编辑或删除公共主页已发表的评论。
- 已绑定帐户：添加、管理或移除已绑定帐户，例如 Instagram 帐户。
- 广告：创建、管理和删除广告。
- 成效分析：使用公共主页、帖子和广告成效分析来分析公共主页的表现情况。
- 活动：通过公共主页创建、编辑和删除活动。
- 移除和禁止参与互动：从公共主页移除用户或禁止用户在公共主页参与互动。

此外，拥有包含完全控制权的 Facebook 管理权限的用户还可以管理：

- 设置：管理和编辑所有设置，例如公共主页信息及删除公共主页。
- 权限：授予或移除用户对公共主页或绑定的 Instagram 帐户的 Facebook 管理权限或任务权限，其中包括拥有包含完全控制权的 Facebook 管理权限的用户。

> 授予其他人包含完全控制权的 Facebook 管理权限，则他们将拥有与您相同的权限。这意味着他们也可以授予其他用户管理公共主页、**移除**公共主页中的用户（**包括您**）或删除公共主页的权限。

**任务权限**

> 可以通过其他管理工具来管理公共主页，例如 Meta Business Suite、创作工作室、广告管理工具或商务管理平台。这意味着他们无法切换到公共主页，也**无法在 Facebook 上管理公共主页**。拥有任务权限的用户可以管理以下内容：

- 内容：创建、管理或删除公共主页上的任何内容，例如帖子、快拍等。申请和使用管理原创内容的权利以及可能由此内容变现的方法。
- 消息和社群动态：在收件箱中以公共主页身份回复私信、发表评论、管理不想看的内容和举报公共主页动态。
- 广告：创建、管理和删除广告以及其他与广告相关的任务。
- 成效分析：查看公共主页、内容、广告以及其他指标的表现情况。

**社群管理员权限**

社群管理员拥有管理**公共主页直播**聊天的权限。他们无法切换到公共主页，也无法在 Facebook 上管理公共主页。社群管理员可以采取以下操作来管理直播聊天：

- 删除或举报评论。
- 暂时限制用户使用直播聊天 15 分钟。
- 禁止用户在当前直播或该公共主页的所有直播中互动。
- 在直播聊天顶部置顶评论。

#### 媒体与帖子

- 帖子删除后，绑定的媒体素材会自动删除

- 合并失败的视频可以删除

- 图片与帖子
  - 多张图片的帖子，可以一张张删除图片，帖子图片随之减少，最后一张删除后，帖子随之删除
  - 未发布之前，fbid可以重复使用，效果是绑定了新帖，旧帖图片将会消失

#### 评论相关

- 在Facebook官方评论只会出现根评论和二级评论，
  - 在 Facebook 展示时可以展示出回复和被回复的层级结构
  - 在 Meta Business 中却只能展示两级结构，与 graphapi请求的结果一致
  - 不能按用户拆分正是因为如此，两级无法保证用户与第三者的会话关系，一个回复第三者的评论可能被挂在用户的会话中
- 但是，通过api调用回复评论，却可以创造出多层级的结构
- 所以，我们通过 api 回复时，尽量与官方保持一致，统一回复到根评论
- 敏捷回复，可以按根评论拆分，每个根评论拆成独立的会话，是群聊的形式
