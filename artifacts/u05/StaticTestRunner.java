import java.lang.reflect.InvocationTargetException;
import org.junit.jupiter.api.Test;

public final class StaticTestRunner {
    private StaticTestRunner() {}

    public static void main(String[] args) throws Exception {
        int passed = 0;
        for (String className : args) {
            Class<?> testClass = Class.forName(className);
            var constructor = testClass.getDeclaredConstructor();
            constructor.setAccessible(true);
            Object instance = constructor.newInstance();
            for (var method : testClass.getDeclaredMethods()) {
                if (!method.isAnnotationPresent(Test.class)) {
                    continue;
                }
                method.setAccessible(true);
                try {
                    method.invoke(instance);
                } catch (InvocationTargetException exception) {
                    throw new AssertionError(
                            testClass.getSimpleName() + "." + method.getName() + " failed",
                            exception.getCause());
                }
                passed++;
                System.out.println("PASS " + testClass.getSimpleName() + "." + method.getName());
            }
        }
        System.out.println("TOTAL_PASS=" + passed);
    }
}
