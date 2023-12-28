# Django

## 项目结构

```
- 入口app			默认和项目同名
	asgi.py		接收网络请求（异步）
	wsgi.py		接收网络请求（同步）
	urls.py		路由
	settings.py	配置文件
	__init__.py
- app1
	__init__.py
	apps.py		app启动类
	admin.py	默认提供的后台管理
	models.py	操作数据库
	tests.py	单元测试
	views.py	与url对应的函数
	- migrations	数据库变更记录
		__init__.py
manage.py		项目管理文件，启动项目，创建app，数据管理
```

app就是类似java的模块，使用manage.py创建app

```python
python manage.py startapp app名称
```

settings.py

```python
INSTALLED_APPS = [
    ...
    'app1.apps.App1Config'
]
```

## hello Django

urls.py

```python
from app1 import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('index', views.index)
]
```

views.py

```python
from django.http import HttpResponse

# Create your views here.
def index(request):
    return HttpResponse("hello django")
```

## 返回页面

```python
def user_list(request):
    return render(request,'user_list.html')		## 在app目录下的templates目录下创建页面，静态文件放在static中
```

**模板语法**

```python
def user_list(request):
    name = 'li'
    roles = [1,2,3]
    info = {"name":"li","age":11}
    return render(request,'user_list.html',{name:name,roles:roles,info:info})
```

```html
<div>
    {{name}}
</div>

<div>
    {% for item in roles %}
    <span>{{item}}</span>
    {% endfor %}
</div>

<div>
    {% for k,v in info.items %}
    <span>{{k}}:{{v}}</span>
    {% endfor %}
</div>

{% if name == 'li' %}
<h1>+++++++</h1>
{% else %}
<h1>-------</h1>
{% endif %}
```

**资源引入**

```html
<link rel="stylesheet" href="{% static 'plugin...min.css' %}">
 <script src="{% static 'js/jquery-3.6.0.min.js' %}"></script>
```

**模板继承**

定义模板layout.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="{% static 'plugin...min.css' %}">
    {% block css %}{% endblock %}				<!--相当于插槽-->
</head>
<body>
    <h1>标题</h1>
    <div>
        {% block content %}{% endblock %}		<!--相当于插槽-->
    </div>
    <h1>底部</h1>
    
    <script src="{% static 'js/jquery-3.6.0.min.js' %}"></script>
    {% block js %}{% endblock %}				<!--相当于插槽-->
</body>
</html>
```

继承

```html
{% extends 'layout.html' %}						<!--继承-->

{% block css %}									<!--填充插槽-->
	<link rel="stylesheet" href="{% static 'pluxxx.css' %}">
	<style>
		...
	</style>
{% endblock %}


{% block content %}								<!--填充插槽-->
    <h1>首页</h1>
{% endblock %}


{% block js %}									<!--填充插槽-->
	<script src="{% static 'js/jqxxxin.js' %}"></script>
{% endblock %}
```



## 请求



```python
request.GET			## url中的参数
request.POST		## 请求体
```

## 响应

```python
return HttpResponse("hello django")
return render(request,'user_list.html',{name:name,roles:roles,info:info})
return redirect('http://www.baidu.com')
```

## 数据库

```sh
pip install mysqlclient 
```

settings.py

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'gx_day15',  # 数据库名字
        'USER': 'root',
        'PASSWORD': 'root123',
        'HOST': '127.0.0.1',  # 那台机器安装了MySQL
        'PORT': 3306,
    }
}
```

models.py --- 自动创建、修改、删除表

```python
class UserInfo(models.Model):
    name = models.CharField(verbose_name='姓名', max_length=32)
    password = models.CharField(verbose_name='密码', max_length=64)
    age = models.IntegerField(verbose_name='年龄')
    account = models.DecimalField(verbose_name='账户', max_digits=10, decimal_places=2, default=0)
    create_time = models.DateTimeField(verbose_name='创建时间')
    ## 代码约束 --- 可选项
    gender_choices = (
        (1, '男'),
        (2, '女'),
    )
    gender = models.SmallIntegerField(verbose_name='性别', choices=gender_choices)
    ## 外键 to-关联的表，to_field关联字段，on_delete删除时的选项：CASCADE一起删，SET_NULL置空
    ## null是否可以为空
    depart = models.ForeignKey(to="Department", to_field="id", on_delete=models.CASCADE)
    depart = models.ForeignKey(to="Department", to_field="id", null=True, blank=True, on_delete=models.SET_NULL)
```

```sh
python manage.py makemigrations
python manage.py migrate
```

**增删改查**

```python
UserInfo.objects.create(name="li", password="xxxxx", age=18)	# 增
UserInfo.objects.filter(id=3).delete()							# 删
UserInfo.objects.filter(id=3).update()							# 改
UserInfo.objects.filter(id=3)									# 查： 是一个对象的列表
```

查

```python
models.PrettyNum.objects.filter(id=12)       # 等于12
models.PrettyNum.objects.filter(id__gt=12)   # 大于12
models.PrettyNum.objects.filter(id__gte=12)  # 大于等于12
models.PrettyNum.objects.filter(id__lt=12)   # 小于12
models.PrettyNum.objects.filter(id__lte=12)  # 小于等于12
data_dict = {"id__lte":12}
models.PrettyNum.objects.filter(**data_dict)


models.PrettyNum.objects.filter(mobile="999")               # 等于
models.PrettyNum.objects.filter(mobile__startswith="1999")  # 筛选出以1999开头
models.PrettyNum.objects.filter(mobile__endswith="999")     # 筛选出以999结尾
models.PrettyNum.objects.filter(mobile__contains="999")     # 筛选出包含999

## 分页
queryset = models.PrettyNum.objects.all()[0:10]			# 第1页
queryset = models.PrettyNum.objects.all()[10:20]		# 第2页
```



## Form & ModelForm

**Form**

```python
class MyForm(Form):
    user = forms.CharField(widget=forms.Input)
    pwd = form.CharFiled(widget=forms.Input)
    email = form.CharFiled(widget=forms.Input)
    account = form.CharFiled(widget=forms.Input)
    create_time = form.CharFiled(widget=forms.Input)
    depart = form.CharFiled(widget=forms.Input)
    gender = form.CharFiled(widget=forms.Input)


def user_add(request):
    if request.method == "GET":
        form = MyForm()
        return render(request, 'user_add.html',{"form":form})
```

- 生成表单

  ```html
  <form method="post">
      {% for field in form%}				<!--  遍历 -->
      	{{ field }}
      {% endfor %}
      <!-- <input type="text"  placeholder="姓名" name="user" /> -->		<!-- 单个 -->
  </form>
  ```

**ModelForm**

- 校验数据 

```python
class MyForm(ModelForm):
    xx = form.CharField*("...")			## 单独配置某字段的校验
    class Meta:							## 批量配置
        model = UserInfo				
        fields = ["name","password","age","xx"]


def user_add(request):
    if request.method == "GET":
        form = MyForm()
        return render(request, 'user_add.html',{"form":form})
```

