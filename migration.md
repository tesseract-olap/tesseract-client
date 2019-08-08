# Migration guide for `mondrian-rest-client` users

Changes respect to `mondrian-rest-client`:

## Client:

- method `.query()` was renamed to `.execQuery()`. Parameters are the same.
- method `.member()` was removed because tesseract server doesn't supports it.

## Query:

Note: tesseract and mondrian handle different structures for fullnames and cuts: 
- For fullnames, mondrian uses `[Dim].[Hie].[Lvl]` and tesseract uses `Dim.Hie.Lvl`.
- For cuts, mondrian uses `[Dim].[Hie].[Lvl].&MemberKey` when there's 1 member and `{[Dim].[Hie].[Lvl].&MemberKey,[Dim].[Hie].[Lvl].&MemberKey}` for more than 1, while tesseract uses `Dim.Hie.Lvl.MemberKey` for 1 member and `Dim.Hie.Lvl.MemberKey,MemberKey` for more than one.

- methods `.getDrilldowns()`, `.getMeasures()`, etc, were removed.
- method `.drilldown(dim: string, hie: string, lvl: string)` was refactored to `.addDrilldown(level: string | Level)`. If string, must be the fullname in format "Dim.Hie.Lvl" or "Dim.Lvl".
- method `.cut(cut: string)` was refactored to `.addCut()`. This method supports two overloads:  
    * `.addCut(cut: string)`, which works the same as the old method.
    * `.addCut(level: Level, members: Member[])`, which receives the separate objects and constructs the cut string internally.
- method `.filter(msr: string, comparison: string, value: string | number)` was renamed to `.addFilter()`. Parameters were conserved, but method doesn't work yet (throws NotImplementedError).
- method `.measure(msr: string)` was refactored to `.addMeasure(msr: string | Measure)`.
- method `.property(propName: string)` was renamed to `.addProperty(propName: string)`. Method throws NotImplementedError.
- method `.caption(propName: string)` was removed in the meanwhile we discuss the definitive way to implement localization. I'll try to implement the current way ASAP.
- `.pagination()` and `.sorting()` were renamed to `.setPagination()` and `.setSorting()`. Both not supported by tesseract yet, throw NotImplementedError.
- `.option(key: string, value: string | number)` was renamed to `.setOption(key: string, value: string | number)`.
- `.path(format: string)` was renamed to `.getPath(format: string)`.
