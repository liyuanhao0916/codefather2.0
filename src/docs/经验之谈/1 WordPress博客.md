# WordPress

## 更改文章的链接

- `lyh_posts`：文章表，默认是 `wp_posts`
- `post_content_filtered`：源文章字段
- `post_content`：转为html后的字段

```sql
UPDATE
  lyh_posts
SET
  post_content_filtered = REPLACE(
    post_content_filtered,
    'https://imgs-1253920081.cos.ap-beijing.myqcloud.com/',
    'http://minio.botuer.com/study-node/old/'
  ),
  post_content = REPLACE(
    post_content,
    'https://imgs-1253920081.cos.ap-beijing.myqcloud.com/',
    'http://minio.botuer.com/study-node/old/'
  );
```

## 缩略图

- 更改代码`/www/wwwroot/www.botuer.com/wp-content/themes/lolimeow-master/module/config/fun-article.php`

```php
function _get_post_thumbnail( $single=true, $must=true ) {  
    global $post;
    $html = '';	
	//如果有特色图片则取特色图片
	if ( has_post_thumbnail() ){
		$domsxe = get_the_post_thumbnail();
        preg_match_all('/<img.*?(?: |\\t|\\r|\\n)?src=[\'"]?(.+?)[\'"]?(?:(?: |\\t|\\r|\\n)+.*?)?>/sim', $domsxe, $strResult, PREG_PATTERN_ORDER);  
        $images = $strResult[1];
        foreach($images as $src){
			$html = sprintf('src="%s"', $src);
            break;
		}
	}else{		
/*		$content = $post->post_content;
		preg_match_all('/<img.*?(?: |\\t|\\r|\\n)?src=[\'"]?(.+?)[\'"]?(?:(?: |\\t|\\r|\\n)+.*?)?>/sim', $content, $strResult, PREG_PATTERN_ORDER);
		$images = count($strResult[1]);
		if($images > 0){//没有设置特色图片则取文章第一张图片		
			$html = sprintf ('src="'.$strResult[1][0].'"  alt="'.trim(strip_tags( $post->post_title )).'"');
		}else{//既没有设置特色图片、文章内又没图片则取默认图片
		$html = sprintf ('src="'.boxmoe_rand_thumbnail().'"  alt="'.trim(strip_tags( $post->post_title )).'"');
		}*/
		
		
		//没有设置特色图片,则取默认图片
		$html = sprintf ('src="'.boxmoe_rand_thumbnail().'"  alt="'.trim(strip_tags( $post->post_title )).'"');
	}
	return $html;
}
```

