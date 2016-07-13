# Ifの問題

> この記事を読む前には、
>
> 前文（[TypeSafe@企業・中大規模プロジェクト](?typesafe_in_java_enterprise/TypeSafeCollection)）
> を事前に習得することがお勧めです。

> 所要時間：約５分

# 問題例

よく見られるソースコードです

```java
void doFoo(List<Integer> list) {

	if (!list.isEmpty()) {
	    int num = list.get(0); // 1件目を取得するために、empty事前にチェックする必要。

	    doBar(num);
	}
}
```


# 問題１

## 問題

上記の実装が許せるシステムには、１つ潜在の危険性（バグ）があります：


`!list.isEmpty()`の判定と、`list.get(0)`が２ステップで分けられているので、

もし`list.isEmpty()`を判定せずに、
`list.get(0)`を呼び出してしまうと、
`IndexOutOfBoundsException`が発生する可能性あります。

## TypeSafe解決案　課題

前文（[TypeSafe@企業・中大規模プロジェクト](?typesafe_in_java_enterprise/TypeSafeCollection)）
で説明したように、ListをMayEmptyListとNotEmptyList分かれて、Listがもっと安全に使われると説明しました。

`list.get(0)`を`NotEmptyList.first()`に書き替えすれば、絶対IndexOutOfBoundsExceptionになら無いよう保証できます。

但し、MayEmptyListからNotEmptyListに変換するため、サンプルの書き方だっと、２ステップが分かれてしまって、結局危険性（バグ）が残ってしまいます。


```java
void doFoo(MayEmptyList<Integer> mayEmpty) {

	if (!mayEmpty.isEmpty()) {
	    NotEmpytList notEmpty = convertToNotEmpytList(mayEmpty); // 課題：2ステップ問題解消できず

	    int num = notEmpty.first(); // notEmptyは絶対1以上だから、get(0)をfirst()で安全でlistにアクセスできる。

	    doBar(num);
	}
}
```

## 課題対応

[Java8でLambda]()の対応は大きな進化です。

TypeSafeからの観点で、`実行時のExceptionをなるべくCompile時点で無くす`の方針がございます。



## 問題2

サンプルソースコードの問題は、List自体は、
配列の要素がindexで自由にアクセスできること

２点の潜在問題あります。



