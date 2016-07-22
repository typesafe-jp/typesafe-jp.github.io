## なぜTypeSafe

TypeSafeは、いつも品質高いソフトウェアをお客様に提供するため、
`バグはできるだけ早めに排除する`基本原則として、
ソフトウェアを開発しています。

 具体的には、

1. エラー（バグ）は、`実行`段階で発生するより、できるだけ`実行前`（例え、コンパイル）の段階で検知する
2. 実行する段階でも、バグを混入しにくいため、[Defensive(防御的な)プログラミング](https://en.wikipedia.org/wiki/Defensive_programming)を提唱する
3. 曖昧な仕様よりバグの混入させないために、厳密な型（`TypeSafe`）の[Interface API](https://ja.wikipedia.org/wiki/アプリケーションプログラミングインタフェース)を定義すべきと提唱する

---

## TypeSafeのフォーカス

TypeSafeは、下記のテーマの中心で研究活動を行っています。

> 現時点一部資料のみ公開し、お気軽く[お問い合わせ](inquire.html)ください。

### TypeSafe for Enterprise

 - [中大規模企業開発向けのTypeSafe](?typesafe_in_java_enterprise/TypeSafeCollection)
<span class="glyphicon glyphicon-time"></span>15分

### TypeSafe Technologies

#### 静的な言語の王様： Java

 - [バグの潜在：nullの危険性](?typesafe_in_java/TypeSafeNull)
<span class="glyphicon glyphicon-time"></span>5分
 - [バグの潜在：if...else..の危険性](?typesafe_in_java/TypeSafeIfElse)
<span class="glyphicon glyphicon-time"></span>5分
 - [バグの潜在：配列へアクセス、不必要な自由](?typesafe_in_java/TypeSafeIndexOutOfBound)
<span class="glyphicon glyphicon-time"></span>5分
 - [バグの潜在：Java世界で危険な常識](?typesafe_in_java/TypeSafeJavaLang_not_open)
<span class="glyphicon glyphicon-time"></span>5分

#### Web言語の王様: JavaScript

 - [JavaScriptもTypeSafe道へ](?typesafe_in_web/TypeSafeJS_not_open)
<span class="glyphicon glyphicon-time"></span>5分

#### ビジネスの基盤： Database

 - [災難から守る：データベースもバージョン管理](?typesafe_in_database/TypeSafeCRUD_not_open)
<span class="glyphicon glyphicon-time"></span>10分

#### マルチコア世界へ: 並列プログラミング

 - [TypeSafeは並列処理と相性が良い](?typesafe_in_database/TypeSafeConcurrency_not_open)
<span class="glyphicon glyphicon-time"></span>5分

