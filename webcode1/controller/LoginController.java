package com.example.webcode1.controller;

import com.example.webcode1.model.User;
import com.example.webcode1.repository.UserRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 * 处理网站登录请求的控制器
 */
@Controller
public class LoginController {

    private final UserRepository userRepository;

    // 构造器注入 UserRepository
    public LoginController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 处理 GET 请求，跳转到登录页
     * 访问地址: http://localhost:8080/login
     */
    @GetMapping("/login")
    public String showLoginForm() {
        // 返回静态文件 login.html
        return "login.html"; 
    }

    /**
     * 处理 POST 请求，执行登录验证
     */
    @PostMapping("/login")
    public String login(@RequestParam String username, 
                        @RequestParam String password,
                        RedirectAttributes redirectAttributes) {

        // 1. 根据用户名查询用户
        User user = userRepository.findByUsername(username);

        // 2. 验证用户和密码
        if (user != null && user.getPassword().equals(password)) {
            // 登录成功
            System.out.println("用户 " + username + " 登录成功！");
            // 重定向到成功页面 (假设您有一个 success.html)
            return "redirect:/success.html"; 
        } else {
            // 登录失败
            System.out.println("用户 " + username + " 登录失败：用户名或密码错误。");
            // 重定向回登录页并添加错误消息
            redirectAttributes.addFlashAttribute("errorMessage", "用户名或密码错误，请重试。");
            return "redirect:/login"; 
        }
    }
    
    // 假设的成功页面
    @GetMapping("/success.html")
    public String successPage() {
        return "success.html"; 
    }
}