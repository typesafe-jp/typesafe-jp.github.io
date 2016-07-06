#Ifの問題

#問題例

よく見られるソースコードです

```java
void doFoo(List<Integer> list) {

	if (!list.isEmpty()) {
	    int num = list.get(0);

	    doBar(num);
	}
}
```


#何の問題でしょうか。

１つの危険性は、
`!list.isEmpty()`の判定と、`list.get(0)`が２ステップで分けられています。

そうしたら、list.isEmpty()を判定せずに、
`list.get(0)`を呼び出してしまうと、
`IndexOutOfBoundsException`が発生する可能性あります。

#対策

TypeSafeからの観点で、
対象ソースコードの問題はList自体は、

- ゼロ件と可能性あること
- 配列のindexでアクセスできることです。

前文（[TypeSafe@企業・中大規模プロジェクト](?typesafe_in_java_enterprise/TypeSafeCollection)）
も説明したように、
それで、MayEmptyListとNotEmptyListで書き替えば、

