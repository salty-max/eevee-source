import fs, { write, WriteStream } from "fs";
import { REPLWriter } from "repl";
import Eevee from ".";

class AstGenerator {
  public static main(argv: Array<string>): void {
    if (argv.length !== 3) {
      console.error("Usage: generate_ast <output_directory>");
      process.exit(64);
    }

    const outputDir: string = argv[2];

    this.defineAst(outputDir, "Expr", [
      "Binary   -> left: Expr, operator: Token, right: Expr",
      "Grouping -> expression: Expr",
      "Literal  -> value: Object",
      "Postfix  -> left: Expr, operator: Token",
      "Unary    -> operator: Token, right: Expr",
    ]);
  }

  private static defineAst(
    outputDir: string,
    baseName: string,
    types: Array<string>
  ): void {
    const path: string = `${outputDir}/${baseName}.ts`;
    const writer: WriteStream = fs.createWriteStream(path, { flags: "w+" });

    writer.write(`import Token from "./Token";`);
    writer.write("\n\n");
    this.defineVisitor(writer, baseName, types);
    writer.write("\n");
    writer.write(`export abstract class ${baseName} {`);
    writer.write("\n");
    writer.write("  abstract accept<R>(visitor: Visitor<R>): R");
    writer.write("\n");
    writer.write("}");
    writer.write("\n\n");

    // The AST classes.
    types.forEach((type) => {
      const className: string = type.split("->")[0].trim();
      const fields = type.split("->")[1].trim();
      this.defineType(writer, baseName, className, fields);
    });
  }

  private static defineType(
    writer: WriteStream,
    baseName: string,
    className: string,
    fieldList: string
  ) {
    writer.write(`export class ${className} extends ${baseName} {`);
    writer.write("\n");

    // Store parameters in field.
    const fields: Array<string> = fieldList.split(", ");

    // Fields.
    fields.forEach((field) => {
      writer.write(`  ${field};`);
      writer.write("\n");
    });

    writer.write("\n");

    // Constructor.
    writer.write(`  constructor(${fieldList}) {`);
    writer.write("\n");
    writer.write("    super();");
    writer.write("\n");

    fields.forEach((field) => {
      const name: string = field.split(":")[0];
      writer.write(`    this.${name} = ${name};`);
      writer.write("\n");
    });
    writer.write("  }");
    writer.write("\n\n");

    writer.write("  override accept<R>(visitor: Visitor<R>): R {");
    writer.write("\n");
    writer.write(`    return visitor.visit${className}${baseName}(this);`);
    writer.write("\n");
    writer.write("  }");
    writer.write("\n");

    writer.write("}");
    writer.write("\n\n");
  }

  private static defineVisitor(
    writer: WriteStream,
    baseName: string,
    types: Array<string>
  ): void {
    writer.write("export interface Visitor<R> {");
    writer.write("\n");

    types.forEach((type) => {
      const typeName: string = type.split("->")[0].trim();
      writer.write(
        `  visit${typeName}${baseName}<R>(${baseName.toLowerCase()}: ${typeName}): R;`
      );
      writer.write("\n");
    });
    writer.write("}");
    writer.write("\n");
  }
}

AstGenerator.main(process.argv);
